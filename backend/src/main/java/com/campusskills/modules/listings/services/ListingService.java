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
        return listingRepository.findById(id).compose(listing -> {
            if (listing == null) {
                return Future.failedFuture("NOT_FOUND");
            }
            if (Boolean.FALSE.equals(listing.getActive())) {
                return Future.failedFuture("NOT_FOUND"); // Treat inactive as not found publicly
            }
            System.out.println("[LISTING] Retrieved listing | listingId=" + id);
            return Future.succeededFuture(listing);
        });
    }

    public Future<io.vertx.core.json.JsonObject> searchListings(io.vertx.core.json.JsonObject filters, int page, int limit) {
        return listingRepository.countSearch(filters).compose(total -> {
            return listingRepository.search(filters, page, limit).map(listings -> {
                int totalPages = (int) Math.ceil((double) total / limit);
                
                io.vertx.core.json.JsonArray data = new io.vertx.core.json.JsonArray();
                for (Listing l : listings) {
                    data.add(io.vertx.core.json.JsonObject.mapFrom(l));
                }
                
                return new io.vertx.core.json.JsonObject()
                    .put("data", data)
                    .put("pagination", new io.vertx.core.json.JsonObject()
                        .put("total", total)
                        .put("page", page)
                        .put("limit", limit)
                        .put("totalPages", totalPages)
                    );
            });
        });
    }
}
