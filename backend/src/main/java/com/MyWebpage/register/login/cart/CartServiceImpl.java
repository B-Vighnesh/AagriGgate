package com.MyWebpage.register.login.cart;

import com.MyWebpage.register.login.exception.ResourceNotFoundException;
import com.MyWebpage.register.login.crop.Crop;
import com.MyWebpage.register.login.approach.ApproachFarmerService;
import com.MyWebpage.register.login.crop.CropQueryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartItemRepo cartItemRepo;
    private final CropQueryService cropQueryService;
    private final ApproachFarmerService approachFarmerService;

    public CartServiceImpl(CartItemRepo cartItemRepo, CropQueryService cropQueryService, ApproachFarmerService approachFarmerService) {
        this.cartItemRepo = cartItemRepo;
        this.cropQueryService = cropQueryService;
        this.approachFarmerService = approachFarmerService;
    }

    @Override
    public void addToCart(Long buyerId, Long cropId, Double quantity) {
        Crop crop = requireAvailableCrop(cropId, buyerId);
        double requestedQuantity = normalizeQuantity(quantity);
        validateRequestedQuantity(requestedQuantity, crop);

        CartItem cartItem = cartItemRepo.findByBuyerIdAndCropId(buyerId, cropId).orElseGet(CartItem::new);
        if (cartItem.getId() == null) {
            cartItem.setBuyerId(buyerId);
            cartItem.setCropId(cropId);
            cartItem.setCreatedAt(LocalDateTime.now());
            cartItem.setQuantity(requestedQuantity);
        } else {
            double nextQuantity = (cartItem.getQuantity() == null ? 0.0 : cartItem.getQuantity()) + requestedQuantity;
            validateRequestedQuantity(nextQuantity, crop);
            cartItem.setQuantity(nextQuantity);
        }
        cartItemRepo.save(cartItem);
    }

    @Override
    public void updateQuantity(Long buyerId, Long cartId, Double quantity) {
        CartItem cartItem = cartItemRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!buyerId.equals(cartItem.getBuyerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this cart item");
        }
        Crop crop = requireAvailableCrop(cartItem.getCropId(), buyerId);
        double requestedQuantity = normalizeQuantity(quantity);
        validateRequestedQuantity(requestedQuantity, crop);
        cartItem.setQuantity(requestedQuantity);
        cartItemRepo.save(cartItem);
    }

    @Override
    public void removeFromCart(Long buyerId, Long cartId) {
        CartItem cartItem = cartItemRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!buyerId.equals(cartItem.getBuyerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this cart item");
        }
        cartItemRepo.delete(cartItem);
    }
    @Override
    public void removeFromCart(Long cropId) {
        cartItemRepo.deleteByCropId(cropId);
    }

    @Override
    public void removeCartItemsForFarmerCrops(Long farmerId) {
        cartItemRepo.deleteByFarmerCropOwnerId(farmerId);
    }

    @Override
    public Page<CartItemDTO> getCart(Long buyerId, String keyword, String type, String sortBy, int page, int size) {
        return cartItemRepo.findCartViewsByBuyerId(
                buyerId,
                normalizeFilter(keyword),
                normalizeType(type),
                normalizeSort(sortBy),
                buildPageRequest(page, size)
        );
    }

    @Override
    public CartCheckoutResponseDTO checkout(Long buyerId) {
        List<CartItem> items = cartItemRepo.findByBuyerId(buyerId);
        int success = 0;
        int failure = 0;
        List<String> messages = new ArrayList<>();

        for (CartItem item : items) {
            try {
                Crop crop = requireAvailableCrop(item.getCropId(), buyerId);
                validateRequestedQuantity(item.getQuantity(), crop);
                if (approachFarmerService.hasRejectedApproach(buyerId, item.getCropId())) {
                    approachFarmerService.softDeleteExistingApproach(buyerId, item.getCropId());
                }
                ResponseEntity<String> response = approachFarmerService.createApproach(buyerId, item.getCropId(), item.getQuantity());
                if (response.getStatusCode().is2xxSuccessful()) {
                    cartItemRepo.delete(item);
                    success++;
                    messages.add("Request sent for " + crop.getCropName());
                } else {
                    failure++;
                    messages.add(response.getBody());
                }
            } catch (Exception ex) {
                failure++;
                messages.add(ex.getMessage() == null ? "Unable to checkout cart item." : ex.getMessage());
            }
        }

        return new CartCheckoutResponseDTO(success, failure, messages);
    }

    private Crop requireAvailableCrop(Long cropId, Long buyerId) {
        return cropQueryService.requireAvailableCropForBuyer(cropId, buyerId);
    }

    private void validateRequestedQuantity(Double requestedQuantity, Crop crop) {
        if (requestedQuantity == null || requestedQuantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
        }
        if (crop.getQuantity() != null && requestedQuantity > crop.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity exceeds available crop quantity");
        }
    }

    private double normalizeQuantity(Double quantity) {
        return quantity == null ? 1.0 : quantity;
    }

    private PageRequest buildPageRequest(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);
        return PageRequest.of(safePage, safeSize, Sort.unsorted());
    }

    private String normalizeFilter(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeType(String value) {
        return value == null || value.isBlank() || "all".equalsIgnoreCase(value) ? null : value.trim().toLowerCase();
    }

    private String normalizeSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "newest";
        }
        return sortBy.trim().toLowerCase();
    }
}
