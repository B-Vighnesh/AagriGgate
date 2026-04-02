package com.MyWebpage.register.login.market;

import com.MyWebpage.register.login.news.util.NewsTime;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class MarketQueryService {

    private final MarketRepository marketRepository;

    public MarketQueryService(MarketRepository marketRepository) {
        this.marketRepository = marketRepository;
    }

    public List<MarketResultResponse> search(MarketSearchRequest request) {
        LocalDate yesterday = LocalDate.now(NewsTime.IST).minusDays(1);
        LocalDate fromDate = request.fromDate();
        LocalDate toDate = request.toDate();

        if (fromDate == null && toDate == null) {
            fromDate = yesterday;
            toDate = yesterday;
        } else if (fromDate == null) {
            fromDate = toDate;
        } else if (toDate == null) {
            toDate = fromDate;
        }

        if (fromDate.isAfter(toDate)) {
            fromDate = toDate;
        }
        if (ChronoUnit.DAYS.between(fromDate, toDate) > 6) {
            fromDate = toDate.minusDays(6);
        }

        LocalDate finalFromDate = fromDate;
        LocalDate finalToDate = toDate;

        Specification<Market> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("commodity"), request.crop().trim()));
            predicates.add(cb.equal(root.get("state"), request.state().trim()));
            predicates.add(cb.between(root.get("arrivalDate"), finalFromDate, finalToDate));

            if (request.district() != null && !request.district().isBlank()) {
                predicates.add(cb.equal(root.get("district"), request.district().trim()));
            }
            if (request.priceMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("modalPrice"), request.priceMin()));
            }
            if (request.priceMax() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("modalPrice"), request.priceMax()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };

        PageRequest pageRequest = PageRequest.of(
                0,
                20,
                Sort.by(
                        Sort.Order.desc("modalPrice"),
                        Sort.Order.desc("arrivalDate"),
                        Sort.Order.asc("district"),
                        Sort.Order.asc("marketName")
                )
        );

        return marketRepository.findAll(specification, pageRequest)
                .stream()
                .map(MarketResultResponse::from)
                .toList();
    }
}
