import React, { useState } from "react";
import TopBar from "../components/TopBar";
import FeedbackForm from "../components/FeedbackForm";

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (feedback) => {
    console.log("Feedback submitted:", feedback);
    setSubmitted(true);
  };

  return (
    <div>
      <TopBar
        eyebrow="Your voice"
        title="Feedback"
        subtitle="Share your experience and help improve DecisionHub."
      />

      {submitted ? (
        <div className="state-block">
          <h3>Thank you for your feedback</h3>
          <p>
            Your feedback has been recorded. We appreciate
            you helping us improve the platform.
          </p>

          <button
            className="btn brass"
            style={{ marginTop: 20 }}
            onClick={() => setSubmitted(false)}
          >
            Submit more feedback
          </button>
        </div>
      ) : (
        <FeedbackForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}