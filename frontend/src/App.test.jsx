import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./routes/AppRoutes", () => ({
  default: () => <div data-testid="app-routes">App Routes</div>,
}));

vi.mock("./context/CartContext", () => ({
  CartProvider: ({ children }) => <div data-testid="cart-provider">{children}</div>,
}));

vi.mock("./context/WishlistContext", () => ({
  WishlistProvider: ({ children }) => <div data-testid="wishlist-provider">{children}</div>,
}));

vi.mock("./context/language/LanguageContext", () => ({
  LanguageProvider: ({ children }) => <div data-testid="language-provider">{children}</div>,
}));

describe("App", () => {
  test("renders app routes inside providers", () => {
    render(<App />);

    expect(screen.getByTestId("cart-provider")).toBeInTheDocument();
    expect(screen.getByTestId("wishlist-provider")).toBeInTheDocument();
    expect(screen.getByTestId("language-provider")).toBeInTheDocument();
    expect(screen.getByTestId("app-routes")).toBeInTheDocument();
  });
});
