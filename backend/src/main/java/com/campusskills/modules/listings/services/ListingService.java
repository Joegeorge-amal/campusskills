package com.campusskills.modules.listings.services;

import com.campusskills.modules.listings.models.Listing;
import com.campusskills.modules.listings.repositories.ListingRepository;
import io.vertx.core.Future;

public class ListingService {
    
    private final ListingRepository listingRepository;

    public ListingService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public Future<String> createListing(Listing listing) {
        listing.setActive(true);
        
        return listingRepository.create(listing).onSuccess(listingId -> {
            System.out.println("[LISTING] Created listing | listingId=" + listingId + " teacherId=" + listing.getTeacherId());
        });
    }

    public Future<Listing> getListingById(String id) {
        return listingRepository.findById(id);
    }
}
