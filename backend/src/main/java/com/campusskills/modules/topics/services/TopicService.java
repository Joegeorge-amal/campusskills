package com.campusskills.modules.topics.services;

import com.campusskills.modules.topics.models.Topic;
import com.campusskills.modules.topics.repositories.TopicRepository;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TopicService {

    private final TopicRepository topicRepository;

    public TopicService(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    public Future<List<Topic>> getAllTopics(String category, String q) {
        return topicRepository.search(category, q);
    }

    public Future<Topic> getTopicById(String id) {
        return topicRepository.findById(id).compose(topic -> {
            if (topic == null) {
                return Future.failedFuture("TOPIC_NOT_FOUND");
            }
            return Future.succeededFuture(topic);
        });
    }

    public Future<Void> seedSystemTopics() {
        return topicRepository.findAll().compose(existingTopics -> {
            List<TopicSeedData> seedList = getSeedList();
            List<Future> futures = new ArrayList<>();

            for (TopicSeedData data : seedList) {
                boolean exists = existingTopics.stream()
                        .anyMatch(t -> t.getName().equalsIgnoreCase(data.name));
                
                if (!exists) {
                    System.out.println("Adding missing topic: " + data.name);
                    Topic topic = new Topic();
                    topic.setName(data.name);
                    
                    String normalized = data.name.toLowerCase()
                        .replace("+", "plus")
                        .replace("#", "sharp")
                        .replaceAll("[^a-z0-9]", "");
                    topic.setNormalizedName(normalized);
                    
                    topic.setCategory(data.category);
                    topic.setIsSystemTopic(true);
                    topic.setCertifiable(data.certifiable);
                    topic.setCreatedAt(System.currentTimeMillis());
                    topic.setUpdatedAt(System.currentTimeMillis());
                    
                    futures.add(topicRepository.create(topic));
                }
            }

            if (futures.isEmpty()) {
                System.out.println("Topics already up to date. Found " + existingTopics.size() + " topics.");
                return Future.succeededFuture();
            }

            return CompositeFuture.all(futures).mapEmpty();
        });
    }

    private List<TopicSeedData> getSeedList() {
        return Arrays.asList(
            // Programming & Tech
            new TopicSeedData("Python", "Programming & Tech", true),
            new TopicSeedData("Java", "Programming & Tech", true),
            new TopicSeedData("C++", "Programming & Tech", true),
            new TopicSeedData("C", "Programming & Tech", true),
            new TopicSeedData("C#", "Programming & Tech", true),
            new TopicSeedData("JavaScript", "Programming & Tech", true),
            new TopicSeedData("TypeScript", "Programming & Tech", true),
            new TopicSeedData("React", "Programming & Tech", true),
            new TopicSeedData("Node.js", "Programming & Tech", true),
            new TopicSeedData("Express.js", "Programming & Tech", true),
            new TopicSeedData("HTML/CSS", "Programming & Tech", true),
            new TopicSeedData("SQL", "Programming & Tech", true),
            new TopicSeedData("MongoDB", "Programming & Tech", true),
            new TopicSeedData("Git & GitHub", "Programming & Tech", true),
            new TopicSeedData("Docker", "Programming & Tech", true),
            new TopicSeedData("Kubernetes", "Programming & Tech", true),
            new TopicSeedData("AWS", "Programming & Tech", true),
            new TopicSeedData("Android Development (Kotlin)", "Programming & Tech", true),
            new TopicSeedData("iOS Development (Swift)", "Programming & Tech", true),
            new TopicSeedData("Machine Learning", "Programming & Tech", true),
            new TopicSeedData("Data Structures & Algorithms", "Programming & Tech", true),
            new TopicSeedData("Cybersecurity", "Programming & Tech", true),
            new TopicSeedData("Linux", "Programming & Tech", true),
            new TopicSeedData("Computer Networks", "Programming & Tech", true),

            // Academic & Computer Science
            new TopicSeedData("Calculus", "Academic & Computer Science", true),
            new TopicSeedData("Linear Algebra", "Academic & Computer Science", true),
            new TopicSeedData("Physics", "Academic & Computer Science", true),
            new TopicSeedData("Chemistry", "Academic & Computer Science", true),
            new TopicSeedData("Biology", "Academic & Computer Science", true),
            new TopicSeedData("Statistics", "Academic & Computer Science", true),
            new TopicSeedData("Economics", "Academic & Computer Science", true),
            new TopicSeedData("History", "Academic & Computer Science", true),
            new TopicSeedData("Psychology", "Academic & Computer Science", true),
            new TopicSeedData("Literature", "Academic & Computer Science", true),
            new TopicSeedData("Discrete Mathematics", "Academic & Computer Science", true),
            new TopicSeedData("Operating Systems", "Academic & Computer Science", true),
            new TopicSeedData("Database Management Systems", "Academic & Computer Science", true),
            new TopicSeedData("Public Speaking", "Academic & Computer Science", true),

            // Creative & Digital Media
            new TopicSeedData("UI/UX Design", "Creative & Digital Media", true),
            new TopicSeedData("Figma", "Creative & Digital Media", true),
            new TopicSeedData("Adobe Photoshop", "Creative & Digital Media", true),
            new TopicSeedData("Adobe Illustrator", "Creative & Digital Media", true),
            new TopicSeedData("Adobe Premiere Pro", "Creative & Digital Media", true),
            new TopicSeedData("After Effects", "Creative & Digital Media", true),
            new TopicSeedData("Graphic Design", "Creative & Digital Media", true),
            new TopicSeedData("Video Editing", "Creative & Digital Media", true),
            new TopicSeedData("Photography", "Creative & Digital Media", true),
            new TopicSeedData("Blender (3D Modeling)", "Creative & Digital Media", true),
            new TopicSeedData("Digital Illustration", "Creative & Digital Media", true),
            new TopicSeedData("Typography", "Creative & Digital Media", true),
            new TopicSeedData("Content Creation", "Creative & Digital Media", true),
            new TopicSeedData("YouTube Editing", "Creative & Digital Media", true),

            // Languages
            new TopicSeedData("English", "Languages", true),
            new TopicSeedData("Spanish", "Languages", true),
            new TopicSeedData("French", "Languages", true),
            new TopicSeedData("German", "Languages", true),
            new TopicSeedData("Japanese", "Languages", true),
            new TopicSeedData("Mandarin Chinese", "Languages", true),
            new TopicSeedData("Korean", "Languages", true),
            new TopicSeedData("Hindi", "Languages", true),
            new TopicSeedData("Sign Language", "Languages", true),

            // Music & Audio
            new TopicSeedData("Guitar", "Music & Audio", true),
            new TopicSeedData("Piano", "Music & Audio", true),
            new TopicSeedData("Vocals/Singing", "Music & Audio", true),
            new TopicSeedData("Music Production (Ableton/FL Studio)", "Music & Audio", true),
            new TopicSeedData("Audio Engineering", "Music & Audio", true),
            new TopicSeedData("Violin", "Music & Audio", true),
            new TopicSeedData("Drums", "Music & Audio", true),

            // Sports & Fitness
            new TopicSeedData("Chess", "Sports & Fitness", true),
            new TopicSeedData("Fitness Coaching", "Sports & Fitness", true),
            new TopicSeedData("Yoga", "Sports & Fitness", true),
            new TopicSeedData("Basketball", "Sports & Fitness", true),
            new TopicSeedData("Tennis", "Sports & Fitness", true),
            new TopicSeedData("Swimming", "Sports & Fitness", true),
            new TopicSeedData("Martial Arts", "Sports & Fitness", true),
            new TopicSeedData("Dance", "Sports & Fitness", true)
        );
    }

    private static class TopicSeedData {
        String name;
        String category;
        boolean certifiable;

        TopicSeedData(String name, String category, boolean certifiable) {
            this.name = name;
            this.category = category;
            this.certifiable = certifiable;
        }
    }
}
