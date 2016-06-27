Template.IMonValuetrendSettings.onCreated(function(){
  var template = this;
  template.autorun(function(){
    template.subscribe('imon_dev');
    template.subscribe('imon_countries_dev');
    template.subscribe('imon_indicators');
  });
});

Template.IMonValuetrendSettings.helpers({
  countries: function() { return IMonCountriesDev.find({}, { sort: { name: 1 } }); },
  indicators: function() { return IMonIndicators.find({}, { sort: { shortName: 1 } }); },
  isSelected: function(a, b) { return a == b ? 'selected' : ''; },
  colors: function() { 
    return [
      { code: '#6192BD', name: 'Blue' },
      { code: '#2ca02c', name: 'Green' },
      { code: '#f39c12', name: 'Orange' },
      { code: '#c0392b', name: 'Red' }
    ];
  }
});

Template.IMonValuetrendSettings.events({
  'click .save-settings': function(ev, template) {
    var country = template.find('.country').value;
    var ind = template.find('.indicator').value;
    var color = template.find('.color').value;
    var newData = {
      country: country,
      indicatorName: ind,
      color: color
    };
    if(_.isUndefined(IMonDev.find({ countryCode: country, indAdminName: ind }))) { console.log("No data found!"); }
    template.closeSettings();
    this.set(newData);
  }
});
