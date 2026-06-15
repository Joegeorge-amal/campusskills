package com.campusskills.modules.listings.services;

import com.campusskills.modules.listings.models.Listing;
import com.campusskills.modules.listings.repositories.ListingRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import io.vertx.core.Future;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ListingService {
    
    private static final Logger log = LoggerFactory.getLogger(ListingService.class);
    private final ListingRepository listingRepository;
    private final UserStatsRepository statsRepository;

    public ListingService(ListingRepository listingRepository, UserStatsRepository statsRepository) {
        this.listingRepository = listingRepository;
        this.statsRepository = statsRepository;
    }

    public Future<String> createListing(Listing listing) {
        listing.prepareForSave(); // Trigger dual-write sync
        listing.setActive(true);
        
        // Validation Matrix
        if (listing.getListingType() == com.campusskills.modules.listings.models.ListingType.TEACH) {
            if (listing.getPrice() == null) return Future.failedFuture("Price is required for TEACH listings");
            if (listing.getOfferedSkills() == null || listing.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for TEACH listings");
        } else if (listing.getListingType() == com.campusskills.modules.listings.models.ListingType.LEARN) {
            if (listing.getRequestedSkills() == null || listing.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for LEARN listings");
        } else if (listing.getListingType() == com.campusskills.modules.listings.models.ListingType.SWAP) {
            if (listing.getOfferedSkills() == null || listing.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for SWAP listings");
            if (listing.getRequestedSkills() == null || listing.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for SWAP listings");
        } else if (listing.getListingType() == com.campusskills.modules.listings.models.ListingType.TEACH_SWAP) {
            if (listing.getPrice() == null) return Future.failedFuture("Price is required for TEACH_SWAP listings");
            if (listing.getOfferedSkills() == null || listing.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for TEACH_SWAP listings");
            if (listing.getRequestedSkills() == null || listing.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for TEACH_SWAP listings");
        } else if (listing.getListingType() == com.campusskills.modules.listings.models.ListingType.LEARN_SWAP) {
            if (listing.getOfferedSkills() == null || listing.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for LEARN_SWAP listings");
            if (listing.getRequestedSkills() == null || listing.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for LEARN_SWAP listings");
        } else {
            return Future.failedFuture("Invalid or missing ListingType");
        }
        
        return listingRepository.create(listing).onSuccess(listingId -> {
            log.info("[LISTING] Created listing | listingId={} ownerId={}", listingId, listing.getOwnerId());
            if (statsRepository != null) {
                statsRepository.recordActivity(listing.getOwnerId())
                    .onFailure(err -> log.error("[LISTING] Failed to record activity", err));
            }
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
            return Future.succeededFuture(listing);
        });
    }

    public Future<Void> updateListing(String id, String ownerId, Listing updates) {
        return getListingById(id).compose(existing -> {
            if (!existing.getOwnerId().equals(ownerId)) {
                return Future.failedFuture("UNAUTHORIZED");
            }
            updates.setId(id);
            updates.setOwnerId(ownerId);
            updates.setActive(existing.getActive());
            updates.setCreatedAt(existing.getCreatedAt());
            updates.prepareForSave();

            if (updates.getListingType() == com.campusskills.modules.listings.models.ListingType.TEACH) {
                if (updates.getPrice() == null) return Future.failedFuture("Price is required for TEACH listings");
                if (updates.getOfferedSkills() == null || updates.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for TEACH listings");
            } else if (updates.getListingType() == com.campusskills.modules.listings.models.ListingType.LEARN) {
                if (updates.getRequestedSkills() == null || updates.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for LEARN listings");
            } else if (updates.getListingType() == com.campusskills.modules.listings.models.ListingType.SWAP) {
                if (updates.getOfferedSkills() == null || updates.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for SWAP listings");
                if (updates.getRequestedSkills() == null || updates.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for SWAP listings");
            } else if (updates.getListingType() == com.campusskills.modules.listings.models.ListingType.TEACH_SWAP) {
                if (updates.getPrice() == null) return Future.failedFuture("Price is required for TEACH_SWAP listings");
                if (updates.getOfferedSkills() == null || updates.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for TEACH_SWAP listings");
                if (updates.getRequestedSkills() == null || updates.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for TEACH_SWAP listings");
            } else if (updates.getListingType() == com.campusskills.modules.listings.models.ListingType.LEARN_SWAP) {
                if (updates.getOfferedSkills() == null || updates.getOfferedSkills().isEmpty()) return Future.failedFuture("Offered skills are required for LEARN_SWAP listings");
                if (updates.getRequestedSkills() == null || updates.getRequestedSkills().isEmpty()) return Future.failedFuture("Requested skills are required for LEARN_SWAP listings");
            } else {
                return Future.failedFuture("Invalid or missing ListingType");
            }

            return listingRepository.update(updates).onSuccess(v -> {
                log.info("[LISTING] Updated listing | listingId={} ownerId={}", id, ownerId);
            });
        });
    }

    public Future<Void> deleteListing(String id, String ownerId) {
        return getListingById(id).compose(existing -> {
            if (!existing.getOwnerId().equals(ownerId)) {
                return Future.failedFuture("UNAUTHORIZED");
            }
            return listingRepository.deactivate(id).onSuccess(v -> {
                log.info("[LISTING] Deleted/Deactivated listing | listingId={} ownerId={}", id, ownerId);
            });
        });
    }

    public Future<io.vertx.core.json.JsonObject> searchListings(io.vertx.core.json.JsonObject filters, int page, int limit) {
        String requesterId = filters.getString("requesterId");
        
        Future<java.util.Set<String>> blockedUsersFuture;
        if (requesterId != null) {
            com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
            blockedUsersFuture = userProfileRepository.findByUserId(requesterId).map(profile -> {
                if (profile != null) {
                    return profile.getBlockedUsers();
                }
                return java.util.Collections.emptySet();
            });
        } else {
            blockedUsersFuture = Future.succeededFuture(java.util.Collections.emptySet());
        }

        return blockedUsersFuture.compose(blockedUsers -> {
            if (blockedUsers != null && !blockedUsers.isEmpty()) {
                filters.put("blockedUsers", new io.vertx.core.json.JsonArray(new java.util.ArrayList<>(blockedUsers)));
            }

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
        });
    }
}
