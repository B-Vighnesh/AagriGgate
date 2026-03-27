package com.MyWebpage.register.login.cart;

import org.springframework.data.domain.Page;

public interface CartService {
    void addToCart(Long buyerId, Long cropId, Double quantity);
    void updateQuantity(Long buyerId, Long cartId, Double quantity);
    void removeFromCart(Long buyerId, Long cartId);
    Page<CartItemDTO> getCart(Long buyerId, String keyword, String type, String sortBy, int page, int size);
    CartCheckoutResponseDTO checkout(Long buyerId);
}
