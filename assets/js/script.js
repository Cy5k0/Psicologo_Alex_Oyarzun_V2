document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("myForm");

  // Remove any existing event listeners to prevent multiple bindings
  const oldForm = form.cloneNode(true);
  form.parentNode.replaceChild(oldForm, form);

  oldForm.addEventListener("submit", function (event) {
    // Prevent the default form submission and stop propagation
    event.preventDefault();
    event.stopPropagation();

    // Disable the submit button immediately to prevent multiple clicks
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    // Basic form validation
    if (!name || !email || !phone || !message) {
      showMessage("Por favor complete todos los campos", "error");
      resetSubmitButton(submitButton);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Por favor ingrese un correo electrónico válido", "error");
      resetSubmitButton(submitButton);
      return;
    }

    // AWS SNS message sending
    const params = {
      Message:
        `Nuevo mensaje de contacto:\n\n` +
        `Nombre: ${name}\n` +
        `Email: ${email}\n` +
        `Teléfono: ${phone}\n` +
        `Mensaje: ${message}`,
      TopicArn:
        "arn:aws:sns:us-east-1:183295419448:ContactForm-Psicologo-Alex-Oyarzun",
    };

    // Initialize AWS credentials
    AWS.config.region = "us-east-1";
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-east-1:2778c396-48cc-48d6-b58b-5f66f0f23e90",
    });

    // Create SNS service object
    const sns = new AWS.SNS();

    // Flag to track submission status
    let isSubmitting = false;

    // Publish message to SNS
    if (!isSubmitting) {
      isSubmitting = true;
      sns.publish(params, function (err, data) {
        // Reset submission flag
        isSubmitting = false;

        if (err) {
          console.error("Error enviando mensaje:", err);
          showMessage(
            "Hubo un error al enviar el mensaje. Inténtelo de nuevo.",
            "error"
          );
          resetSubmitButton(submitButton);
        } else {
          showMessage("¡Mensaje enviado exitosamente!", "success");
          oldForm.reset(); // Clear form fields
          resetSubmitButton(submitButton);
        }
      });
    }
  });

  // Function to show messages
  function showMessage(message, type) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll(".alert");
    existingAlerts.forEach((alert) => alert.remove());

    // Create new alert
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${
      type === "error" ? "danger" : "success"
    } mt-3`;
    alertDiv.textContent = message;

    // Insert alert before the form
    oldForm.insertAdjacentElement("beforebegin", alertDiv);
  }

  // Function to reset submit button
  function resetSubmitButton(button) {
    button.disabled = false;
    button.textContent = "Enviar";
  }

  const whatsappBtn = document.getElementById("whatsapp-btn");
  const sections = document.querySelectorAll(".section");

  const observerOptions = {
    root: null,
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        whatsappBtn.classList.add("active");
      } else {
        whatsappBtn.classList.remove("active");
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
});
