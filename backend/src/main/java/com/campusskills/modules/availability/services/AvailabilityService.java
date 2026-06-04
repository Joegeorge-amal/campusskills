package com.campusskills.modules.availability.services;

import com.campusskills.modules.availability.models.AvailabilityException;
import com.campusskills.modules.availability.models.AvailabilitySlot;
import com.campusskills.modules.availability.repositories.AvailabilityRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

import java.util.List;

public class AvailabilityService {

    private final AvailabilityRepository repository;

    public AvailabilityService() {
        this.repository = new AvailabilityRepository();
    }

    public Future<JsonObject> getUserAvailability(String userId) {
        return repository.findSlotsByUserId(userId)
                .compose(slots -> repository.findExceptionsByUserId(userId)
                        .map(exceptions -> new JsonObject()
                                .put("slots", slots)
                                .put("exceptions", exceptions)
                        )
                );
    }

    public Future<Void> updateUserSlots(String userId, List<AvailabilitySlot> newSlots) {
        return repository.deleteSlotsByUserId(userId)
                .compose(v -> {
                    // Save all new slots
                    List<Future<String>> futures = newSlots.stream().map(slot -> {
                        slot.setUserId(userId);
                        return repository.createSlot(slot);
                    }).collect(java.util.stream.Collectors.toList());
                    
                    return Future.all(futures).mapEmpty();
                });
    }

    public Future<String> addException(String userId, AvailabilityException exception) {
        exception.setUserId(userId);
        return repository.createException(exception);
    }

    public Future<Void> deleteException(String exceptionId) {
        return repository.deleteException(exceptionId);
    }
}
