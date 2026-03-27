package com.MyWebpage.register.login.repository;

import com.MyWebpage.register.login.dto.CartItemDTO;
import com.MyWebpage.register.login.model.CartItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByBuyerIdAndCropId(Long buyerId, Long cropId);
    List<CartItem> findByBuyerId(Long buyerId);

    @Query(
            value = """
                    SELECT new com.MyWebpage.register.login.dto.CartItemDTO(
                        ci.id,
                        c.cropID,
                        c.cropName,
                        c.cropType,
                        c.region,
                        c.marketPrice,
                        c.quantity,
                        ci.quantity,
                        c.unit,
                        CASE
                            WHEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, ''))) <> ''
                            THEN trim(concat(coalesce(c.farmer.firstName, ''), ' ', coalesce(c.farmer.lastName, '')))
                            ELSE c.farmer.username
                        END,
                        c.isUrgent,
                        c.isWaste,
                        c.discountPrice,
                        c.status,
                        c.postDate
                    )
                    FROM CartItem ci
                    JOIN Crop c ON c.cropID = ci.cropId
                    WHERE ci.buyerId = :buyerId
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :keyword, '%')))
                      AND (:type IS NULL
                           OR (:type = 'urgent' AND c.isUrgent = true)
                           OR (:type = 'waste' AND c.isWaste = true)
                           OR (:type = 'discount' AND coalesce(c.discountPrice, 0) > 0)
                           OR (:type = 'normal' AND coalesce(c.isUrgent, false) = false AND coalesce(c.isWaste, false) = false AND coalesce(c.discountPrice, 0) = 0))
                    ORDER BY
                        CASE WHEN :sortBy = 'oldest' THEN ci.createdAt END ASC,
                        CASE WHEN :sortBy = 'price-low' THEN c.marketPrice END ASC,
                        CASE WHEN :sortBy = 'price-high' THEN c.marketPrice END DESC,
                        ci.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(ci)
                    FROM CartItem ci
                    JOIN Crop c ON c.cropID = ci.cropId
                    WHERE ci.buyerId = :buyerId
                      AND (:keyword IS NULL
                           OR lower(c.cropName) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.firstName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.lastName, '')) LIKE lower(concat('%', :keyword, '%'))
                           OR lower(coalesce(c.farmer.username, '')) LIKE lower(concat('%', :keyword, '%')))
                      AND (:type IS NULL
                           OR (:type = 'urgent' AND c.isUrgent = true)
                           OR (:type = 'waste' AND c.isWaste = true)
                           OR (:type = 'discount' AND coalesce(c.discountPrice, 0) > 0)
                           OR (:type = 'normal' AND coalesce(c.isUrgent, false) = false AND coalesce(c.isWaste, false) = false AND coalesce(c.discountPrice, 0) = 0))
                    """
    )
    Page<CartItemDTO> findCartViewsByBuyerId(
            @Param("buyerId") Long buyerId,
            @Param("keyword") String keyword,
            @Param("type") String type,
            @Param("sortBy") String sortBy,
            Pageable pageable
    );
}
