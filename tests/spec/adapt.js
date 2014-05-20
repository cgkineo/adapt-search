
//define(function(require){

    //var Backbone = require('backbone');

    var BlockModel = Backbone.Model.extend({
        initialize: function () {
           this.set('type', 'block');
        }
    }, {
        type:"Block"
    })

    var AdaptCollection = Backbone.Collection.extend({
        initialize : function(models, options){
            this.url = options.url;
            this.once('reset', this.loadedData, this);
            this.fetch({reset:true});
        },
        
        loadedData: function() {
            console.log("blocks loaded: " + Adapt.blocks.length);
            Adapt.trigger('adaptCollection:dataLoaded');
        }
        
    });

    Adapt.blocks = new AdaptCollection(null, {
        model: BlockModel,
        url: "data/blocks.json"
    });


 /*   return Adapt;
});*/