const Event = require('../models/Event');
const Banner = require('../models/Banner');
const UnifiedDiscount = require('../models/UnifiedDiscount');
const SpecialOffer = require('../models/SpecialOffer');
const SpinWheel = require('../models/SpinWheel');

class EventPerformanceService {
  
  // Track overall event performance
  static async trackEventPerformance(eventId, metricType, value = 1, userId = null) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Update event performance
      await event.updatePerformance('overall', metricType, value);
      
      // Add to event history
      event.history.push({
        action: 'performance_update',
        timestamp: new Date(),
        userId: userId,
        details: `${metricType} updated by ${value}`,
        componentId: 'overall'
      });
      
      await event.save();
      
      return { success: true, message: 'Performance tracked successfully' };
    } catch (error) {
      console.error('Error tracking event performance:', error);
      throw error;
    }
  }
  
  // Track component-specific performance
  static async trackComponentPerformance(eventId, componentType, componentId, metricType, value = 1, userId = null) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Update component performance in event
      await event.updatePerformance(componentType, metricType, value);
      
      // Update individual component analytics
      let component;
      switch (componentType) {
        case 'banner':
          component = await Banner.findById(componentId);
          if (component) {
            if (metricType === 'displays') await component.recordDisplay();
            else if (metricType === 'clicks') await component.recordClick();
            else if (metricType === 'conversions') await component.recordConversion();
          }
          break;
          
        case 'discount':
          component = await UnifiedDiscount.findById(componentId);
          if (component) {
            if (metricType === 'issued') await component.issueDiscount();
            else if (metricType === 'redeemed') await component.redeemDiscount(value, userId);
          }
          break;
          
        case 'offer':
          component = await SpecialOffer.findById(componentId);
          if (component) {
            if (metricType === 'views') await component.recordView();
            else if (metricType === 'clicks') await component.recordClick();
            else if (metricType === 'activations') await component.recordActivation();
            else if (metricType === 'redemptions') await component.recordRedemption(value);
          }
          break;
          
        case 'spinWheel':
          component = await SpinWheel.findById(componentId);
          if (component) {
            if (metricType === 'spins') await component.recordSpin(userId);
            else if (metricType === 'rewards') await component.recordReward();
            else if (metricType === 'conversions') await component.recordConversion();
          }
          break;
      }
      
      // Add to event history
      event.history.push({
        action: 'component_performance_update',
        timestamp: new Date(),
        userId: userId,
        details: `${componentType} ${metricType} updated by ${value}`,
        componentId: componentId
      });
      
      await event.save();
      
      return { success: true, message: 'Component performance tracked successfully' };
    } catch (error) {
      console.error('Error tracking component performance:', error);
      throw error;
    }
  }
  
  // Get comprehensive event analytics
  static async getEventAnalytics(eventId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Calculate additional metrics
      const analytics = {
        event: {
          id: event._id,
          name: event.name,
          type: event.type,
          status: event.status,
          duration: event.duration,
          isRunning: event.isRunning
        },
        performance: event.performance,
        components: {
          total: event.totalComponents,
          banners: event.components.banners.length,
          discounts: event.components.discounts.length,
          specialOffers: event.components.specialOffers.length,
          spinWheel: event.components.spinWheel.enabled ? 1 : 0
        },
        metrics: {
          // Overall metrics
          totalViews: event.performance.views,
          totalClicks: event.performance.clicks,
          totalConversions: event.performance.conversions,
          totalRevenue: event.performance.revenue,
          
          // Calculated metrics
          clickThroughRate: event.performance.views > 0 ? 
            (event.performance.clicks / event.performance.views) * 100 : 0,
          conversionRate: event.performance.clicks > 0 ? 
            (event.performance.conversions / event.performance.clicks) * 100 : 0,
          revenuePerView: event.performance.views > 0 ? 
            event.performance.revenue / event.performance.views : 0,
          revenuePerClick: event.performance.clicks > 0 ? 
            event.performance.revenue / event.performance.clicks : 0
        },
        componentMetrics: {
          banners: {
            displays: event.performance.bannerMetrics.displays,
            clicks: event.performance.bannerMetrics.clicks,
            conversions: event.performance.bannerMetrics.conversions,
            ctr: event.performance.bannerMetrics.displays > 0 ? 
              (event.performance.bannerMetrics.clicks / event.performance.bannerMetrics.displays) * 100 : 0
          },
          discounts: {
            issued: event.performance.discountMetrics.issued,
            redeemed: event.performance.discountMetrics.redeemed,
            revenue: event.performance.discountMetrics.revenue,
            redemptionRate: event.performance.discountMetrics.issued > 0 ? 
              (event.performance.discountMetrics.redeemed / event.performance.discountMetrics.issued) * 100 : 0
          },
          offers: {
            activations: event.performance.offerMetrics.activations,
            redemptions: event.performance.offerMetrics.redemptions,
            revenue: event.performance.offerMetrics.revenue,
            activationRate: event.performance.offerMetrics.activations > 0 ? 
              (event.performance.offerMetrics.redemptions / event.performance.offerMetrics.activations) * 100 : 0
          },
          spinWheel: {
            spins: event.performance.spinWheelMetrics.spins,
            rewards: event.performance.spinWheelMetrics.rewards,
            conversions: event.performance.spinWheelMetrics.conversions,
            rewardRate: event.performance.spinWheelMetrics.spins > 0 ? 
              (event.performance.spinWheelMetrics.rewards / event.performance.spinWheelMetrics.spins) * 100 : 0
          }
        },
        history: event.history.slice(-10) // Last 10 actions
      };
      
      return analytics;
    } catch (error) {
      console.error('Error getting event analytics:', error);
      throw error;
    }
  }
  
  // Get performance comparison between events
  static async compareEvents(eventIds) {
    try {
      const events = await Event.find({ _id: { $in: eventIds } });
      const comparisons = [];
      
      for (const event of events) {
        const analytics = await this.getEventAnalytics(event._id);
        comparisons.push({
          eventId: event._id,
          eventName: event.name,
          eventType: event.type,
          duration: event.duration,
          performance: analytics.metrics,
          componentCount: analytics.components.total
        });
      }
      
      // Sort by performance (revenue per view)
      comparisons.sort((a, b) => b.performance.revenuePerView - a.performance.revenuePerView);
      
      return comparisons;
    } catch (error) {
      console.error('Error comparing events:', error);
      throw error;
    }
  }
  
  // Get real-time performance updates
  static async getRealTimePerformance(eventId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Get live component data
      const liveData = {
        eventId: event._id,
        eventName: event.name,
        status: event.status,
        lastUpdated: new Date(),
        performance: {
          views: event.performance.views,
          clicks: event.performance.clicks,
          conversions: event.performance.conversions,
          revenue: event.performance.revenue
        },
        components: {
          banners: await this.getComponentLiveData('banner', event.components.banners),
          discounts: await this.getComponentLiveData('discount', event.components.discounts),
          offers: await this.getComponentLiveData('offer', event.components.specialOffers),
          spinWheel: event.components.spinWheel.enabled ? 
            await this.getComponentLiveData('spinWheel', [event.components.spinWheel.wheelId]) : []
        }
      };
      
      return liveData;
    } catch (error) {
      console.error('Error getting real-time performance:', error);
      throw error;
    }
  }
  
  // Helper method to get live component data
  static async getComponentLiveData(componentType, componentConfigs) {
    try {
      const liveData = [];
      
      for (const config of componentConfigs) {
        let component;
        const componentId = config.bannerId || config.discountId || config.offerId || config.wheelId;
        
        switch (componentType) {
          case 'banner':
            component = await Banner.findById(componentId);
            if (component) {
              liveData.push({
                id: component._id,
                name: component.name,
                analytics: component.analytics,
                ctr: component.ctr
              });
            }
            break;
            
          case 'discount':
            component = await UnifiedDiscount.findById(componentId);
            if (component) {
              liveData.push({
                id: component._id,
                name: component.name,
                analytics: component.analytics,
                isValid: component.isValid
              });
            }
            break;
            
          case 'offer':
            component = await SpecialOffer.findById(componentId);
            if (component) {
              liveData.push({
                id: component._id,
                name: component.name,
                analytics: component.analytics,
                conversionRate: component.conversionRate
              });
            }
            break;
            
          case 'spinWheel':
            component = await SpinWheel.findById(componentId);
            if (component) {
              liveData.push({
                id: component._id,
                name: component.name,
                analytics: component.analytics,
                isValid: component.isValid
              });
            }
            break;
        }
      }
      
      return liveData;
    } catch (error) {
      console.error('Error getting component live data:', error);
      return [];
    }
  }
  
  // Generate performance report
  static async generatePerformanceReport(eventId, startDate, endDate) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Filter history by date range
      const filteredHistory = event.history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      // Calculate period performance
      const periodPerformance = {
        startDate,
        endDate,
        totalActions: filteredHistory.length,
        actionBreakdown: {},
        componentPerformance: {},
        revenue: 0
      };
      
      // Analyze actions
      filteredHistory.forEach(entry => {
        periodPerformance.actionBreakdown[entry.action] = 
          (periodPerformance.actionBreakdown[entry.action] || 0) + 1;
      });
      
      // Get component performance for the period
      const components = await this.getComponentLiveData('all', event.components);
      periodPerformance.componentPerformance = components;
      
      return {
        event: {
          id: event._id,
          name: event.name,
          type: event.type
        },
        period: periodPerformance,
        summary: {
          totalViews: event.performance.views,
          totalClicks: event.performance.clicks,
          totalConversions: event.performance.conversions,
          totalRevenue: event.performance.revenue,
          overallCTR: event.performance.views > 0 ? 
            (event.performance.clicks / event.performance.views) * 100 : 0,
          overallConversionRate: event.performance.clicks > 0 ? 
            (event.performance.conversions / event.performance.clicks) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }
}

module.exports = EventPerformanceService;
