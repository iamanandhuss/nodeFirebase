const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  admin
} = require('../config/firebase'); 

const auth = getAuth();

class FirebaseAuthController {

  registerUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required"
      });
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendEmailVerification(auth.currentUser)
          .then(() => {
            res.status(201).json({ message: "Verification email sent! User created successfully!" });
          })
          .catch(error => {
            res.status(500).json({ error: error.message });
          });
      })
      .catch(error => {
        res.status(500).json({ error: error.message || "Error registering user" });
      });
  }

  loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({
      email: "Email is required",
      password: "Password is required"
    });
  }
  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const idToken = userCredential._tokenResponse.idToken;
      if (idToken) {
        // For mobile: Return the ID token in the response
        res.status(200).json({
          message: "User logged in successfully",
          token: idToken
        });
      } else {
        res.status(500).json({ error: "Unable to retrieve ID token" });
      }
    })
    .catch(error => {
      res.status(500).json({ error: error.message || "Login error" });
    });
}   


  logoutUser(req, res) {
    signOut(auth)
      .then(() => {
        res.clearCookie('access_token');
        res.status(200).json({ message: "User logged out successfully" });
      })
      .catch(error => {
        res.status(500).json({ error: error.message || "Logout error" });
      });
  }

  resetPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({ email: "Email is required" });
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        res.status(200).json({ message: "Password reset email sent successfully!" });
      })
      .catch(error => {
        res.status(500).json({ error: error.message || "Password reset error" });
      });
  }
}

module.exports = new FirebaseAuthController();
