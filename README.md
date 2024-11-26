

# 🎬📖 RAWSBE - a Blog and Movie Management System  
_A feature-rich web application for managing blogs and movies with secure user authentication and role-based access._  

## 📌 **Project Overview**  
This application serves as a centralized platform for users to explore blogs and movies. It features secure user authentication and distinguishes between **Admin** and **Regular User** roles for controlled access.

---

## 🚀 **Features**  
- **User Authentication**: Secure login/signup using JWT.  
- **Role-Based Access**: 
  - Admin: Can manage blogs and movies (CRUD operations).  
  - Regular User: Can view content and interact with blogs/movies.  
- **Movie and Blog Management**: Create, update, delete, and browse entries.  
- **Responsive UI**: Built with React and Tailwind CSS for modern design and seamless UX.

---

## 🛠️ **Tech Stack**  
| **Technology** | **Purpose** |
|-----------------|-------------|
| React           | Frontend development |
| Express.js      | Backend API |
| Axios           | API communication |
| OracleDB        | Database management |
| JWT             | Authentication and Authorization |

---

## 🗂️ **Project Structure**  
```plaintext
.
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── api/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
└── README.md
```

---

## 📚 **Installation and Setup**  

### Prerequisites  
- Node.js  
- OracleDB  
- npm 

### Backend Setup  
1. Navigate to the backend directory:  
   ```bash
   cd backend
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Set environment variables in a `.env` file:  
   ```env
   JWT_SECRET=your_secret_key
   ORACLE_DB_USER=username
   ORACLE_DB_PASSWORD=password
   ```
4. Start the server:  
   ```bash
   npm start
   ```

### Frontend Setup  
1. Navigate to the frontend directory:  
   ```bash
   cd frontend
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Start the development server:  
   ```bash
   npm run dev
   ```

---

## ✨ **Key Endpoints**  

### **Authentication**  
```javascript
// Login API
axios.post('/api/auth/login', { 
    email: 'user@example.com', 
    password: 'securepassword' 
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

### **Get Movies**  
```javascript
// Fetching movies
axios.get('/api/movies')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### **Add a Movie (Admin)**  
```javascript
// Adding a movie
axios.post('/api/movies', { 
    title: 'Inception', 
    director: 'Christopher Nolan', 
    genre: 'Sci-Fi' 
}, {
    headers: { Authorization: `Bearer ${yourJWT}` }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

---

## 🔐 **Role-Based Access Flow**  
1. **Regular User**:  
   - Can view blogs and movies.  
   - Restricted from CRUD operations.  

2. **Admin**:  
   - Full control over blogs and movies.  
   - Ability to manage user roles.  

---

## 🖼️ **Preview**  

### **Home Page**  
_A sleek and user-friendly interface showcasing featured blogs and movies._  

![Home Page Preview](https://github.com/Devyalamaddi/Rawsbe/blob/main/Screenshot%202024-11-26%20195107.png)

---

## 🛤️ **Future Scope**    
- Add advanced blog formatting tools.  
- Enhance security features with OAuth2.0.  
- Optimize database queries for better performance.

---

## 👨‍💻 **Contributors**  
- **Devendra Yalamaddi**  
  - _React Developer, Backend Engineer_  
  - [LinkedIn](https://www.linkedin.com/in/devendra-yalamaddi-737852211) | [GitHub](https://github.com/Devyalamaddi)  

