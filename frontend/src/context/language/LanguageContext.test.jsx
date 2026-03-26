import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./LanguageContext";

const Probe = () => {
  const { setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="label">{t("nav.login")}</span>
      <button onClick={() => setLanguage("mr")}>Switch</button>
    </div>
  );
};

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  test("switches language and updates translated text", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );

    expect(screen.getByTestId("label")).toHaveTextContent("Login");
    fireEvent.click(screen.getByRole("button", { name: "Switch" }));

    return waitFor(() => {
      expect(screen.getByTestId("label")).toHaveTextContent("लॉगिन");
      expect(document.documentElement.lang).toBe("mr");
    });
  });
});
