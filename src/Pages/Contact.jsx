// import React from "react";
import emailjs from "@emailjs/browser";
import { useRef } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useTheme } from "../Context/Theme";
import toast from 'react-hot-toast'

function Contact() {
  const { theme } = useTheme();

  const formRef = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_zkau8fo",
        "template_zkqfcfu",
        formRef.current,
        "lBZXPMlvRqVyWkj_-"
      )
      .then(
        () => {
         toast.success("Message sent successfully ✅");
          formRef.current.reset();
        },
        (error) => {
          console.error(error);
          toast.error("Failed to send message ❌");
        }
      );
  };


  return (
    <>
      <Navbar />

      <div
        className={`min-h-screen ubuntu-regular flex flex-col ${theme === "dark"
          ? "bg-gradient-to-b from-slate-700 via-slate-700 to-gray-600 text-white"
          : "bg-gradient-to-b from-gray-100 to-blue-100 text-black"
          }`}
      >
        {/* MAIN */}
        <main className="flex-grow max-w-5xl mx-auto w-full px-4 pt-24">
          <h1 className="text-3xl font-bold text-center mb-2">
            Contact Us
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Have an issue or suggestion? We’d love to hear from you.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* CONTACT INFO */}
            <div
              className={`rounded-lg p-6 ${theme === "dark"
                ? "bg-gray-600"
                : "bg-white shadow"
                }`}
            >
              
              <h2 className="text-xl font-semibold mb-4">
                Get in Touch
              </h2>

              <p className="mb-3">
                📍 <span className="font-medium">Address:</span>
                <br /> Municipal Office, City Center
              </p>

              <p className="mb-3">
                📞 <span className="font-medium">Phone:</span>
                <br /> +91 **********
              </p>

              <p className="mb-3">
                ✉️ <span className="font-medium">Email:</span>
                <br /> support@sla-app.com
              </p>

              <p className="text-sm text-gray-400 mt-4">
                Working hours: Mon – Fri (9 AM – 6 PM)
              </p>
            </div>

            {/* CONTACT FORM */}
            <div
              className={`rounded-lg p-6 ${theme === "dark"
                ? "bg-gray-600"
                : "bg-white shadow "
                }`}
            >
              <h2 className="text-xl font-semibold mb-4">
                Send a Message
              </h2>

              <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="w-full border rounded p-2 focus:outline-none"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  className="w-full border rounded p-2 focus:outline-none"
                />

                <textarea
                  name="message"
                  rows="4"
                  placeholder="Your Message"
                  required
                  className="w-full border rounded p-2 focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                >
                  Send Message
                </button>
              </form>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default Contact;
