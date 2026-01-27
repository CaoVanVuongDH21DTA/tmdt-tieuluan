package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.dto.AddressRequest;
import com.tieuluan.laptopstore.entities.Address;
import com.tieuluan.laptopstore.repositories.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.UUID;

@Service
public class AddressService {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AddressRepository addressRepository;

    public Address createAddress(AddressRequest addressRequest, Principal principal){
        User user= (User) userDetailsService.loadUserByUsername(principal.getName());
        Address address = Address.builder()
                .name(addressRequest.getName())
                .street(addressRequest.getStreet())
                .city(addressRequest.getCity())
                .state(addressRequest.getState())
                .zipCode(addressRequest.getZipCode())
                .phoneNumber(addressRequest.getPhoneNumber())
                .user(user)
                .build();
        return addressRepository.save(address);
    }

    public void deleteAddress(UUID id) {
        addressRepository.deleteById(id);
    }

    public Address updateAddress(UUID id, AddressRequest addressRequest, Principal principal) {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Kiểm tra quyền sở hữu nếu cần
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this address");
        }

        address.setName(addressRequest.getName());
        address.setStreet(addressRequest.getStreet());
        address.setCity(addressRequest.getCity());
        address.setState(addressRequest.getState());
        address.setZipCode(addressRequest.getZipCode());
        address.setPhoneNumber(addressRequest.getPhoneNumber());

        return addressRepository.save(address);
    }

}
