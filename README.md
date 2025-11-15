# Personal Website Frontend

A personal website frontend built with React 19 + Vite, integrated with Go backend API for social interaction features.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 🚀 Features

- **Article System**: Dual-mode support for local articles and backend social posts
- **Comment System**: Full tree-structured comments with nested replies (up to 5 levels)
- **Reaction System**: 7 types of emoji reactions (like, love, haha, wow, sad, angry, care)
- **OAuth Login**: Integrated GitHub/Google third-party authentication
- **Responsive Design**: Dark theme with support for all screen sizes
- **Internationalization**: Multi-language support (Traditional Chinese / English)

## 🛠 Tech Stack

### Frontend Technologies
- **React 19.1.0** - UI Framework
- **Vite 7.0.6** - Build Tool
- **React Router 7.1.1** - Routing
- **Axios** - HTTP Client
- **i18next** - Internationalization

### Backend Integration
- **Go + Gin** - RESTful API
- **Cookie-based Auth** - Authentication
- **Vite Proxy** - CORS Solution

## 📁 Project Structure

```
src/
├── Components/          # React Components
│   ├── Comment/        # Comment System (List, Item, Form)
│   ├── Post/           # Post System (List, Card, Editor)
│   ├── Reaction/       # Reaction Buttons System
│   └── ...
├── hooks/              # Custom Hooks
│   ├── useComments.js  # Comment State Management
│   ├── usePosts.js     # Post State Management
│   └── useReactions.js # Reaction State Management
├── services/           # API Service Layer
│   ├── commentService.js
│   ├── postService.js
│   ├── reactionService.js
│   └── apiClient.js    # Axios Instance
├── Pages/              # Page Components
│   ├── Articles/       # Article List Page
│   ├── ArticleDetail/  # Article Detail Page
│   └── ...
└── config/
    └── api.js          # API Endpoint Configuration
```

## Development Guidelines

Please refer to [Development Preferences](./DEVELOPMENT_PREFERENCES.md) for coding standards and best practices.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app using Vite dev server.\
Open [http://localhost:80](http://localhost:80) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

**Note**: Requires backend service running at `http://backend:80`, or modify the proxy settings in `vite.config.js`.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## 🔧 Environment Setup

### Environment Variables

Create a `.env` file:

```bash
# API Configuration (Use relative path through Vite proxy in dev)
VITE_API_URL=/api
VITE_BASE_URL=
```

### Vite Proxy Configuration

Configure proxy in `vite.config.js` to solve CORS:

```javascript
proxy: {
  '/api': {
    target: 'http://backend:80',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path
  }
}
```

## 🎯 Core Features

### 1. Article System

**Local Articles**:
- Static articles loaded from `src/data/articles/`
- Supports categories, tags, and search filters
- Responsive grid layout

**Social Posts**:
- Dynamically loaded from backend API
- Supports create, edit, delete operations
- Login required for posting

### 2. Comment System

**Features**:
- Tree structure with up to 5 levels of nested replies
- Real-time create, edit, delete
- Automatic parent-child relationship building
- Auto-formatted timestamps (just now, X minutes ago, X days ago)

**API Endpoints**:
- `GET /api/posts/:id/comments` - Get comment list
- `POST /api/posts/:id/comments` - Create comment (auth required)
- `PUT /api/comments/:id` - Update comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)

### 3. Reaction System

**7 Reaction Types**:
- 👍 Like
- ❤️ Love
- 😆 Haha
- 😮 Wow
- 😢 Sad
- 😠 Angry
- 🤗 Care

**Features**:
- Optimistic UI updates
- Real-time count display
- Supports both posts and comments
- Beautiful gradient animations

**API Endpoints**:
- `POST /api/posts/:id/reactions` - Post reactions
- `POST /api/comments/:id/reactions` - Comment reactions
- `GET /api/posts/:id/reactions` - Get post reaction stats
- `GET /api/comments/:id/reactions` - Get comment reaction stats

### 4. Authentication

**OAuth Third-party Login**:
- GitHub OAuth
- Google OAuth

**Auth Mechanism**:
- Cookie-based authentication
- `withCredentials: true` for automatic cookie transmission
- Auto-redirect to login on 401 errors
- Auto-display AuthModal

## 🐛 Debugging Guide

### API Request Issues

If you encounter API request failures, check:

1. **Backend service running**: `curl http://backend:80/api/posts`
2. **Vite proxy config**: Verify proxy settings in `vite.config.js`
3. **Browser console**: Check detailed API request logs

### CORS Issues

Project uses Vite proxy to solve CORS:
- Frontend requests `/api/posts` 
- Vite automatically forwards to `http://backend:80/api/posts`
- No additional CORS setup needed on backend

### Authentication Issues

If unable to react or comment:
1. Confirm you are logged in
2. Check if cookies are being sent correctly
3. View error message (will show "Please login to react 🔐")

## 📚 Related Documentation

- [Project Architecture](./PROJECT_ARCHITECTURE.md)
- [Development Preferences](./DEVELOPMENT_PREFERENCES.md)
- [Coding Style Guide](./CODING_STYLE.md)
- [Cookie Debug Guide](./COOKIE_DEBUG_GUIDE.md)
- [AI Learning Configuration](./AI_LEARNING_CONFIG.md)

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License
