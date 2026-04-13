import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import "../styles/FeedbackForm.css";

const FeedbackForm = ({ onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Feature Request",
    rating: 5,
    message: "",
  });
  const [errors, setErrors] = useState({});

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Sanitize input
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  let updatedValue;

  if (name === "rating") {
    updatedValue = parseInt(value);
  } else {
    updatedValue = value; // ✅ NO sanitization here
  }

  setFormData((prev) => ({
    ...prev,
    [name]: updatedValue,
  }));

  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }
};

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.length === 0) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate category
    const validCategories = ["Bug Report", "Feature Request", "improvement", "Other"];
    if (!validCategories.includes(formData.category)) {
      newErrors.category = "Please select a valid category";
    }

    // Validate rating
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }

    // Validate message
    if (!formData.message || formData.message.length < 10) {
      newErrors.message = "Feedback message must be at least 10 characters";
    } else if (formData.message.length > 1000) {
      newErrors.message = "Feedback message cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sanitizeInput(formData.name),
          email: sanitizeInput(formData.email),
          category: formData.category,
          rating: formData.rating,
          message: sanitizeInput(formData.message),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        category: "Feature Request",
        rating: 5,
        message: "",
      });
      setErrors({});

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-card">
        <h2>Send Us Your Feedback</h2>
        <p className="subtitle">
          Help us improve! Share your thoughts, suggestions, or report issues.
        </p>

        {submitted && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            Thank you! Your feedback has been received successfully.
          </div>
        )}

        {errors.submit && (
          <div className="error-message">
            <span className="error-icon">!</span>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              maxLength="100"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? "error" : ""}
              >
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating *</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    id={`star-${star}`}
                    name="rating"
                    value={star}
                    checked={formData.rating === star}
                    onChange={handleChange}
                  />
                ))}
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label
                      key={star}
                      htmlFor={`star-${star}`}
                      className={`star ${
                        star <= formData.rating ? "active" : ""
                      }`}
                    >
                      ★
                    </label>
                  ))}
                </div>
              </div>
              {errors.rating && <span className="error-text">{errors.rating}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">
              Feedback Message * ({formData.message.length}/1000)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please share your thoughts (minimum 10 characters)..."
              rows="5"
              maxLength="1000"
              className={errors.message ? "error" : ""}
            />
            {errors.message && <span className="error-text">{errors.message}</span>}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
