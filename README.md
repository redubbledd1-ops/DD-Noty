# Noty - A Modern Notes App

A Google Keep-inspired notes application built with React, Vite, Tailwind CSS, and Firebase.

![Noty Screenshot](https://via.placeholder.com/800x400?text=Noty+Notes+App)

## Features

- **Authentication**: Email/password login and registration with session persistence
- **Notes Management**: Create, edit, and delete notes with titles, content, and optional reminders
- **Realtime Sync**: Notes update instantly across all devices using Firestore realtime listeners
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Multi-user Safe**: Each user can only access their own notes

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Prerequisites

- Node.js 18+ installed
- A Firebase account (free tier works)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd noty
npm install
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "noty-app")
4. Enable/disable Google Analytics as preferred
5. Click "Create project"

### 3. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click "Save"

### 4. Create Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add rules next)
4. Select a location closest to your users
5. Click "Enable"

### 5. Add Security Rules

1. In Firestore, go to the **Rules** tab
2. Replace the default rules with the contents of `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /notes/{noteId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

### 6. Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "noty-web")
5. Copy the `firebaseConfig` object values

### 7. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and paste your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSyB...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 8. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all `VITE_FIREBASE_*` variables

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables before deploying
7. Click "Deploy"

### Important: Environment Variables on Vercel

Make sure to add these environment variables in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

## Project Structure

```
noty/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── NoteCard.jsx
│   │   ├── NoteEditor.jsx
│   │   ├── NoteInput.jsx
│   │   └── ProtectedRoute.jsx
│   ├── config/
│   │   └── firebase.js   # Firebase initialization
│   ├── contexts/
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── ThemeContext.jsx   # Theme state
│   ├── hooks/
│   │   └── useNotes.js   # Notes CRUD operations
│   ├── pages/
│   │   ├── Home.jsx      # Main notes page
│   │   ├── Login.jsx     # Login page
│   │   ├── Register.jsx  # Registration page
│   │   └── Settings.jsx  # Settings page
│   ├── services/
│   │   └── notifications.js  # Notification helpers
│   ├── App.jsx           # Main app component
│   ├── index.css         # Global styles
│   └── main.jsx          # Entry point
├── .env.example          # Environment variables template
├── firestore.rules       # Firestore security rules
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Future Enhancements

The app is structured to easily support:

- **Push Notifications**: FCM setup is prepared in `services/notifications.js`
- **Note Colors**: Add color property to notes
- **Labels/Tags**: Organize notes with labels
- **Search**: Filter notes by title/content
- **Archive**: Archive old notes instead of deleting
- **Sharing**: Share notes with other users
- **Rich Text**: Add formatting to note content

## Troubleshooting

### "Permission denied" errors
- Ensure Firestore security rules are published
- Check that the user is logged in
- Verify Firebase config is correct

### Notes not syncing
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Ensure you're using the correct project ID

### Authentication not working
- Verify Email/Password provider is enabled
- Check that auth domain matches your Firebase project

## License

MIT License - feel free to use this project for learning or production.
