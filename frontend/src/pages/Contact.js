import React from 'react';
import ContactHero from '../components/sections/contact/ContactHero';
import ContactForm from '../components/sections/contact/ContactForm';
import ContactInfo from '../components/sections/contact/ContactInfo';
import FAQs from '../components/sections/contact/FAQs';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <FAQs />
    </div>
  );
};

export default Contact;

