import cv2
import numpy as np
import face_recognition
from pymongo import MongoClient
from datetime import datetime
import pickle
import time
import os
import base64

class FaceRecognitionSystem:
    def __init__(self, known_faces_file='known_faces.pkl'):
        # Set up known_faces_file path
        self.known_faces_file = known_faces_file
        
        # Initialize MongoDB connection
        try:
            self.client = MongoClient('mongodb://localhost:27017/')
            self.db = self.client['face_recognition_db']
            self.users_collection = self.db['users']
            print("MongoDB connection successful")
        except Exception as e:
            raise RuntimeError(f"MongoDB connection failed: {e}")
            
        # Initialize video capture with default camera
        self.video_capture = self._initialize_camera()
        
        # Load known faces from MongoDB
        self.known_face_encodings = []
        self.known_face_names = []
        self.load_known_faces_from_db()
        
    def _initialize_camera(self):
        """Initialize the camera with improved settings"""
        capture = cv2.VideoCapture(0)
        if not capture.isOpened():
            raise RuntimeError("Unable to access the camera. Please check your camera connection.")
            
        # Set camera properties for better face detection
        capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        capture.set(cv2.CAP_PROP_AUTOFOCUS, 1)  # Enable autofocus if available
        capture.set(cv2.CAP_PROP_BRIGHTNESS, 150)  # Adjust brightness
        
        # Warm up the camera
        for _ in range(5):
            capture.read()
            time.sleep(0.1)
            
        print("Successfully opened default camera (camera 0)")
        return capture
        
    def load_known_faces_from_db(self):
        """Load known faces from MongoDB database"""
        try:
            # Fetch all users from the database
            users = self.users_collection.find({})
            
            # Clear existing faces
            self.known_face_encodings = []
            self.known_face_names = []
            
            # Load each user's face encoding
            for user in users:
                try:
                    face_encoding = pickle.loads(user['face_encoding'])
                    self.known_face_encodings.append(face_encoding)
                    self.known_face_names.append(user['name'])
                except Exception as e:
                    print(f"Error loading face encoding for user {user['name']}: {e}")
                    continue
                
            print(f"Loaded {len(self.known_face_names)} faces from database")
            
        except Exception as e:
            print(f"Error loading faces from database: {e}")
            self.known_face_encodings = []
            self.known_face_names = []

    def register_new_face(self, name, max_attempts=5):
        """Capture face and store encoding in the database with multiple attempts"""
        for attempt in range(max_attempts):
            # Capture multiple frames to ensure camera is stabilized
            for _ in range(3):
                self.video_capture.read()
                
            # Capture the actual frame for processing
            ret, frame = self.video_capture.read()
            if not ret:
                continue
                
            # Convert the image to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Find face locations in the frame
            face_locations = face_recognition.face_locations(rgb_frame, model="hog")
            
            if len(face_locations) == 0:
                if attempt < max_attempts - 1:
                    print(f"Attempt {attempt + 1}: No face detected, trying again...")
                    time.sleep(1)
                    continue
                return False, "No face detected after multiple attempts. Please check lighting and camera position."
                
            if len(face_locations) > 1:
                return False, "Multiple faces detected. Please ensure only one person is in frame."
                
            # Extract the face encoding
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            if len(face_encodings) == 0:
                continue
                
            face_encoding = face_encodings[0]
            
            # Save to database
            try:
                # Check if name already exists
                existing_user = self.users_collection.find_one({'name': name})
                if existing_user:
                    return False, f"User {name} already exists in the database."
                    
                self.users_collection.insert_one({
                    'name': name,
                    'face_encoding': pickle.dumps(face_encoding),
                    'created_at': datetime.now()
                })
                return True, f"User {name} registered successfully."
            except Exception as e:
                return False, f"Error saving to database: {str(e)}"
                
        return False, "Failed to capture a clear face encoding after multiple attempts."

    def cleanup(self):
        """Clean up resources"""
        if self.video_capture.isOpened():
            self.video_capture.release()
            print("Camera released.")
        if self.client:
            self.client.close()
            print("MongoDB connection closed.")

    def save_known_faces(self):
        try:
            with open(self.known_faces_file, 'wb') as f:
                pickle.dump(self.known_faces, f, protocol=pickle.HIGHEST_PROTOCOL)
        except Exception as e:
            raise Exception(f"Error saving known faces: {str(e)}")

    def identify_face(self, frame):
        """Identify faces in the given frame"""
        # Convert the image from BGR color to RGB color
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Find all the faces and face encodings in the current frame
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        
        if not self.known_face_encodings:
            print("No known faces in database. Please register users first.")
            return frame
        
        # Loop through each face in this frame
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=0.6)
            name = "Unknown"
            
            if True in matches:
                first_match_index = matches.index(True)
                name = self.known_face_names[first_match_index]
            
            # Draw a box around the face
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
            
            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 0.6, (255, 255, 255), 1)
        
        return frame

def process_base64_image(base64_string):
    # Remove data:image/jpeg;base64, if present
    if 'base64,' in base64_string:
        base64_string = base64_string.split('base64,')[1]
    
    # Decode base64 string to bytes
    img_data = base64.b64decode(base64_string)
    
    # Convert bytes to numpy array
    nparr = np.frombuffer(img_data, np.uint8)
    
    # Decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert BGR to RGB
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    return rgb_img

def get_face_encoding_from_db(encoding_bytes):
    # Convert bytes back to numpy array
    return np.frombuffer(encoding_bytes, dtype=np.float64)