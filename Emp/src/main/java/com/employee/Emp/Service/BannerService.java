package com.employee.Emp.Service;

import com.employee.Emp.Entity.Banner;
import com.employee.Emp.Entity.Event;
import com.employee.Emp.Repository.BannerRepository;
import com.employee.Emp.Repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private EventRepository eventRepository;

    // ========== Public Endpoints ==========

    public List<Banner> getActiveBanners() {
        return bannerRepository.findActiveBanners(LocalDateTime.now());
    }

    public List<Banner> getActiveBannersByPosition(String position) {
        return bannerRepository.findActiveBannersByPosition(position, LocalDateTime.now());
    }

    public List<Banner> getActiveBannersByEvent(Long eventId) {
        return bannerRepository.findActiveBannersByEvent(eventId, LocalDateTime.now());
    }

    // ========== Admin Endpoints ==========

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByPriorityDesc();
    }

    public Optional<Banner> getBannerById(Long id) {
        return bannerRepository.findById(id);
    }

    public Banner createBanner(Banner banner) {
        if (banner.getPriority() == null) {
            banner.setPriority(1);
        }
        if (banner.getIsActive() == null) {
            banner.setIsActive(true);
        }
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner bannerDetails) {
        return bannerRepository.findById(id)
                .map(banner -> {
                    banner.setName(bannerDetails.getName());
                    banner.setTitle(bannerDetails.getTitle());
                    banner.setSubtitle(bannerDetails.getSubtitle());
                    banner.setImage(bannerDetails.getImage());
                    banner.setPosition(bannerDetails.getPosition());
                    banner.setPriority(bannerDetails.getPriority());
                    banner.setIsActive(bannerDetails.getIsActive());
                    banner.setStartDate(bannerDetails.getStartDate());
                    banner.setEndDate(bannerDetails.getEndDate());
                    banner.setCtaText(bannerDetails.getCtaText());
                    banner.setCtaLink(bannerDetails.getCtaLink());
                    banner.setCtaTarget(bannerDetails.getCtaTarget());
                    if (bannerDetails.getEvent() != null) {
                        banner.setEvent(bannerDetails.getEvent());
                    }
                    return bannerRepository.save(banner);
                })
                .orElse(null);
    }

    public boolean deleteBanner(Long id) {
        if (bannerRepository.existsById(id)) {
            bannerRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Banner toggleBannerStatus(Long id) {
        return bannerRepository.findById(id)
                .map(banner -> {
                    banner.setIsActive(!banner.getIsActive());
                    return bannerRepository.save(banner);
                })
                .orElse(null);
    }

    // ========== Analytics ==========

    public void incrementDisplayCount(Long bannerId) {
        bannerRepository.findById(bannerId).ifPresent(banner -> {
            banner.setDisplayCount(banner.getDisplayCount() + 1);
            bannerRepository.save(banner);
        });
    }

    public void incrementClickCount(Long bannerId) {
        bannerRepository.findById(bannerId).ifPresent(banner -> {
            banner.setClickCount(banner.getClickCount() + 1);
            bannerRepository.save(banner);
        });
    }

    public void incrementConversionCount(Long bannerId) {
        bannerRepository.findById(bannerId).ifPresent(banner -> {
            banner.setConversionCount(banner.getConversionCount() + 1);
            bannerRepository.save(banner);
        });
    }

    // ========== Event Management ==========

    public List<Event> getAllEvents() {
        return eventRepository.findAllByOrderByStartDateDesc();
    }

    public List<Event> getActiveEvents() {
        return eventRepository.findActiveEvents(LocalDateTime.now());
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public Event createEvent(Event event) {
        if (event.getIsActive() == null) {
            event.setIsActive(true);
        }
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event eventDetails) {
        return eventRepository.findById(id)
                .map(event -> {
                    event.setName(eventDetails.getName());
                    event.setDescription(eventDetails.getDescription());
                    event.setStartDate(eventDetails.getStartDate());
                    event.setEndDate(eventDetails.getEndDate());
                    event.setIsActive(eventDetails.getIsActive());
                    event.setType(eventDetails.getType());
                    event.setDiscountPercentage(eventDetails.getDiscountPercentage());
                    return eventRepository.save(event);
                })
                .orElse(null);
    }

    public boolean deleteEvent(Long id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
