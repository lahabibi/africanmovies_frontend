import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

test("opens every Contact Us link in the visitor's email client", () => {
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Footer />
    </MemoryRouter>,
  );

  const contactLinks = screen.getAllByRole("link", { name: "Contact Us" });
  expect(contactLinks).toHaveLength(2);
  contactLinks.forEach((link) => {
    expect(link).toHaveAttribute("href", "mailto:info@africanmovies.com");
  });
});
