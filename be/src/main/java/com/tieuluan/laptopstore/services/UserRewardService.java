package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.entities.UserDiscount;
import com.tieuluan.laptopstore.auth.repositories.UserDiscountRepository;
import com.tieuluan.laptopstore.entities.Discount;
import com.tieuluan.laptopstore.repositories.DiscountRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.ArrayList;

@Service
public class UserRewardService {

    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private UserDiscountRepository userDiscountRepository;

    public void giveWelcomeDiscount(User user) {
        if (user == null) return;

        Optional<Discount> existingDiscountOpt = discountRepository.findByCode("WELCOME10");
        if (existingDiscountOpt.isEmpty()) {
            return;
        }

        Discount discount = existingDiscountOpt.get();

        if (user.getUserDiscounts() == null) {
            user.setUserDiscounts(new ArrayList<>());
        }

        boolean hasDiscount = user.getUserDiscounts().stream()
                .anyMatch(ud -> ud.getDiscount().getCode().equalsIgnoreCase("WELCOME10"));

        if (!hasDiscount) {
            UserDiscount userDiscount = UserDiscount.builder()
                    .user(user)
                    .discount(discount)
                    .used(false)
                    .usedDate(null)
                    .build();

            userDiscountRepository.save(userDiscount);
        }
    }
}
