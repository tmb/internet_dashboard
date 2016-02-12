Template.RDRWidget.helpers({
  services: function() {
    return RDRData.find({ category: this.category });
  },
  serviceSlug: function() {
    return s.slugify(this.service);
  },
  metrics: function() {
    return Settings.metrics;
  },
  isSorted: function() {
    return this.name === Template.parentData().sortMetric ? 'sorted' : 'not-sorted';
  },
  isTilted: function() {
    return this.tilted ? 'tilted' : '';
  }
});

Template.RDRWidget.onCreated(function() {
  var template = this;
  template.autorun(function() {
    template.subscribe('ranking_digital_rights', Template.currentData().category);
  });
});

Template.RDRWidget.onRendered(function() {
  var template = this;
  var pieColors = d3.scale.category10();
  var $serviceList = template.$('table tbody');
  template.autorun(function() {
    if (!template.subscriptionsReady()) { return; }

    var category = Template.currentData().category;
    var sort = Template.currentData().sortMetric;
    var $metrics, serviceSlug, data, selector, cell;

    $serviceList.empty();

    var records = RDRData.find({ category: category }).fetch();
    console.log('1.REINOS.records: ');
    console.log(records);
    records = _.sortBy(records, function(record) {
      console.log('1.1.REINOS: record');
      console.log(record);
      return _.findWhere(record.service_metrics, { name: sort }).rank;
    });
    console.log('2.REINOS.sorted records: ');
    console.log(records);
    records.forEach(function(record) {
      serviceSlug = s.slugify(record.service);
      $serviceList.append(
        '<tr class="service service-' + serviceSlug + '">' +
          '<td><div class="service">' + record.service + '</div><div class="company">' + record.company + ' [' + record.country +']</div></td>' + '</tr>');

      selector = '.service-' + serviceSlug;
      metricsNode = template.find(selector);

      Settings.metrics.forEach(function(metric) {
        var serviceMetricData = _.findWhere(record.service_metrics, { name: metric.name });
        var companyMetricData = _.findWhere(record.company_metrics, { name: metric.name });
        data = [serviceMetricData.value, 100.0 - serviceMetricData.value, companyMetricData.value];
        cell = $('<td>').addClass('text-center').appendTo(metricsNode).get(0);
        radius = metric.name === Settings.totalMetric ?
          Settings.pie.totalRadius : Settings.pie.radius;
        drawGraph(cell, data, radius, pieColors(metric.name));
      });
    });
  });
});

function drawGraph(parent, data, radius, color) {
  var width = radius,
      height = radius+22,
      pieRadius = Math.min(width, height) / 2;

  var arc = d3.svg.arc()
    .outerRadius(pieRadius)
    .innerRadius(Settings.pie.innerRadius);

  var pie = d3.layout.pie().startAngle(Math.PI).endAngle(3 * Math.PI).sort(null);

  var svg = d3.select(parent).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d, i) {
      return i === 0 ? color: Settings.pie.background;
    });

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 4)
    .text(Math.round(data[0]));

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline','hanging')
    .attr('y', radius/2+2)
    .text(Math.round(data[2]));
  
}