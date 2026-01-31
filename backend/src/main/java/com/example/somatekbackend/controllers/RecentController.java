package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.RecentActivityDto;
import com.example.somatekbackend.models.RecentActivity;
import com.example.somatekbackend.service.IRecentActivityService;
import com.example.somatekbackend.util.PageUtil;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("recent-activity")
@AllArgsConstructor
public class RecentController {

    private final IRecentActivityService recentActivityService;

    @PostMapping("")
    public RecentActivity createRecentActivity(@RequestBody RecentActivityDto recentActivityDto, @RequestHeader("title") String title) {

        return recentActivityService.createRecentActivity(recentActivityDto, title);
    }

    @GetMapping("/user")
    public Page<RecentActivityDto> getRecentActivity(@RequestParam("userId") String userId, @RequestParam("pageNumber") Integer pageNumber, @RequestParam("pageSize") Integer pageSize ) {
        return recentActivityService.getRecentActivitiesByUserId(userId, PageUtil.getPageable(pageNumber, pageSize));
    }

    @GetMapping("/user/date-range")
    public Page<RecentActivityDto> getRecentActivity(@RequestParam("userId") String userId, @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate, @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate, @RequestParam("pageNumber") Integer pageNumber, @RequestParam("pageSize") Integer pageSize ) {
        return recentActivityService.getRecentActivitiesByUserIdByDateRange(userId, startDate, endDate, PageUtil.getPageable(pageNumber, pageSize));
    }

    @GetMapping("/user/id")
    public RecentActivity getRecentActivityById(@RequestParam("recentActivityId") String recentActivityById) {
        return recentActivityService.getRecentActivityById(recentActivityById);
    }
}
