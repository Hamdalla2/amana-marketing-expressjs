const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", (req, res) => {
  res.sendFile(__dirname + "/data/users.json");
});

const deviceData = JSON.parse(
  fs.readFileSync(__dirname + "/data/marketing-data.json"),
);

new_string: app.get("/device-performance", (req, res) => {
  const deviceType = req.query.type;
  if (!deviceType) {
    return res
      .status(400)
      .send("Please provide a device type using the 'type' query parameter.");
  }

  const aggregatedData = {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0,
    revenue: 0,
  };

  deviceData.campaigns.forEach((campaign) => {
    campaign.device_performance.forEach((device) => {
      if (device.device.toLowerCase() === deviceType.toLowerCase()) {
        aggregatedData.impressions += device.impressions;
        aggregatedData.clicks += device.clicks;
        aggregatedData.conversions += device.conversions;
        aggregatedData.spend += device.spend;
        aggregatedData.revenue += device.revenue;
      }
    });
  });

  res.send(aggregatedData);
});

app.get("/weekly-performance", (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .send("Please provide both startDate and endDate query parameters.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res
      .status(400)
      .send("Invalid date format. Please use YYYY-MM-DD.");
  }

  const results = [];

  deviceData.campaigns.forEach((campaign) => {
    campaign.weekly_performance.forEach((week) => {
      const weekStart = new Date(week.week_start);
      const weekEnd = new Date(week.week_end);

      if (weekStart >= start && weekEnd <= end) {
        results.push({
          campaign_name: campaign.name,
          ...week,
        });
      }
    });
  });

  res.send(results);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
