package com.MyWebpage.register.login.cart;

import com.MyWebpage.register.login.service.CartService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    public ResponseEntity<Void> addToCart(@RequestBody CartRequestDTO request, Authentication authentication) {
        Long buyerId = Long.parseLong(authentication.getName());
        cartService.addToCart(buyerId, request.getCropId(), request.getQuantity());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{cartId}")
    public ResponseEntity<Void> updateCartQuantity(
            @PathVariable Long cartId,
            @RequestBody CartRequestDTO request,
            Authentication authentication
    ) {
        Long buyerId = Long.parseLong(authentication.getName());
        cartService.updateQuantity(buyerId, cartId, request.getQuantity());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartId, Authentication authentication) {
        Long buyerId = Long.parseLong(authentication.getName());
        cartService.removeFromCart(buyerId, cartId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<CartItemDTO>> getCart(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long buyerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cartService.getCart(buyerId, keyword, type, sortBy, page, size));
    }

    @PostMapping("/checkout")
    public ResponseEntity<CartCheckoutResponseDTO> checkout(Authentication authentication) {
        Long buyerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(cartService.checkout(buyerId));
    }
}
