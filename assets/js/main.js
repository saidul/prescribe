(function(window, $, document){
    var modalCallback;

var Prescription = {
    init: function(){
        Prescription.reset();
        Prescription.initializeModal();

        Prescription.addNewOeControlFeature();
        Prescription.addNewTestControlFeature();
        Prescription.addNewComplainControlFeature();
        Prescription.addNewTreatmentControlFeature();
        Prescription.addResetControlFeature();
        Prescription.addAdviceFeature();
        Prescription.settingsFeature();




        Prescription.addPrintFeature();

        Prescription.chromePrintWorkground();


        setTimeout(Prescription.loadAllData, 2000);
    },
    addChiefComplain: function(data){
        var str  = '<span class="cc-name">'+data.name+'</span>';
        if(data.comment) str += ' <span class="cc-comment">'+ data.comment +'</span>';

        $('<li class="complain-entry"><button data-dismiss="alert" class="close">&times;</button>'+str+'</li>').appendTo('#chief-complains');
    },

    addTest: function(data){
        $('<li><button data-dismiss="alert" class="close">&times;</button>'+data+'</li>').appendTo('#advised-tests');
    },

    addOE: function(data){
        $('<li><button data-dismiss="alert" class="close">&times;</button> '+data.shortName+': '+data.value+ ' ' +data.unit+'</li>').appendTo('#onsite-experiment');
    },

    addAdvice: function(data){
        $('<li data-item-id="' + data.id + '"> <button data-dismiss="alert" class="close">&times;</button> '+data.text+'</li>').appendTo('#advice');
    },

    reset: function(){
        $('#advised-tests').empty().parent().addClass('no-print');
        $('#chief-complains').empty().parent().addClass('no-print');
        $('#onsite-experiment').empty().parent().addClass('no-print');
        //$('#treatment').empty().parent().addClass('no-print');

        $('#advice').empty();
        $( '#data-load-status').hide();

        var d = new Date();
        $('#prescription-date').html(d.getDay() + '/' + d.getMonth() + '/' + d.getYear());
    },

    print: function(){
        $('body').addClass('printing');
        window.print();
        $('body').removeClass('printing');
    },

    addPrintFeature: function(){
        $('#print').on('click', function(){
            Prescription.print();
        });
    },

    addResetControlFeature: function(){
        $('#reset').on('click', function(){
            Prescription.showConfirmDialog("Reset?","Do you really want to reset this prescription?", function(){
                Prescription.reset();
            });

        });
    },

    addAdviceFeature: function(){
        $(DAO).on('dataloaded.advice', function(){
            var $el = $('#advice-selection-list');
            $el.empty();
            if(DAO.data.advice.length > 0) {
                $(DAO.data.advice).each(function(idx, item){
                    $el.append('<li data-item-id="'+item.id+'"><label><input type="checkbox"><span>'+ item.text +'</span></label></li>');
                });
            }
            $el.append('<li>New: <input type="text" id="newAdviceTxt" class="span6"></li>');
        });

        $('#add-advice').on('click', function(){
            $('#advice-selection-dialog :checkbox').removeAttr('checked');
            $('#advice li').each(function(){
                $('#advice-selection-dialog li[data-item-id='+$(this).data('itemId')+'] :checkbox').attr('checked', true);
            });
            $('#advice-selection-dialog').modal('show');
        });

         $('#advice-selection-dialog').delegate('#newAdviceTxt', 'keyup', function(e){
             if(e.keyCode == 13 ){
                 var value = $(this).val().trim();
                 if(value)
                    $(this).parent().before('<li data-item-id="new_'+ Date.now() +'"><label><input type="checkbox" checked="checked"><span>'+ value +'</span></label></li>');
                 $(this).val('');

             }
         });


        $('#advice-selection-dialog .btn.btn-primary').click(function(){
            $('#advice').empty();
            $('#advice-selection-dialog').find(':checked').parent().each(function(){
                Prescription.addAdvice({
                    id: $(this).parent().data('itemId'),
                    text: $(this).find('span').html()
                });
            });
        });
    },
    addNewOeControlFeature: function(){

        $(DAO).on('dataloaded.oe', function(){
            var $el = $('#btn-add-oe').find('ul.dropdown-menu');
            $el.empty();
            if(DAO.data.oe.length) {
                $(DAO.data.oe).each(function(idx, item){
                    $el.prepend('<li class="existing-oe-item" data-short-name="'+ item.shortName +'" ><a href="#" >'+ item.shortName +': </a></li>');
                });

                $el.append('<li class="divider"></li>');
            }
            $el.append('<li id="btn-new-oe" class="new-oe"><a href="#">Add new...</a></li>')
        });


        $('#btn-new-oe').live('click', function(){
               $('#modal-oe').removeClass('existing').modal('show').find('#oe-form').each(function(){this.reset()});
        });

        $('#btn-add-oe').delegate('li.existing-oe-item', 'click', function(){
            $('#modal-oe').addClass('existing').modal('show').find('#oe-form').each(function(){this.reset()});
            var oe = DAO.getOnsiteExamenationByShortName($(this).data('shortName'));
            $('#oe-short-name').val(oe.shortName);
            $('#oe-name').val(oe.name);
            //$('#oe-value').val(oe.value);
            $('#oe-unit').val(oe.unit);
        });

        $('#oe-form').submit(function(){
            var data = $('#oe-form').serializeJSON();
            Prescription.addOE(data);
            $('#modal-oe').modal('hide');
           return false;
        });
    },

    addNewComplainControlFeature: function(){
        var timerId;

        $('#chief-complains-input').change(function(){
                var   val = $(this).val()
                    , hasSubquery = val.indexOf('>') > -1
                    , mainQuery = hasSubquery ? val.split('>', 2)[0].trim() : val
                    , subQuery = hasSubquery ? val.split('>', 2)[1].trim() : ''
                    , rec = DAO.getCheifComplainByName(mainQuery)

                if(subQuery.indexOf('{num}') > -1) {
                    $(this).val(mainQuery + ' > ' + subQuery.split('{num}', 2)[0]);
                } else if(!hasSubquery && rec && rec.comments){
                    $(this).val(mainQuery + ' > ');
                    $(this).typeahead('lookup');
                } else {
                    //clearTimeout(timerId)
                    //timerId = setTimeout(function(){
                        Prescription.addChiefComplain({name: mainQuery, comment: subQuery});
                        $(this).val('');
                    //}, 200);

                }

        });

        $(DAO).on('dataloaded.cc', function(){
            $el = $('#chief-complains-input');
            $el.typeahead({
                source: DAO.data.cc,
                matcher: Prescription.utils.typeAhedMatcher,
                highlighter: Prescription.utils.typeAhedHighlighter,
                sorter: Prescription.utils.typeAhedSorter

            });
        });
    },

    addNewTestControlFeature: function(){
        $(DAO).on('dataloaded.tests', function(){
            $('#advised-tests-input').typeahead({
                source: DAO.data.tests,
                matcher: Prescription.utils.typeAhedMatcher ,
                sorter: Prescription.utils.typeAhedSorter

            });
        });

        $('#advised-tests-input').change(function(){
                Prescription.addTest($(this).val());
                $(this).val('');
            });
    },

    addNewTreatmentControlFeature: function(){
        $(DAO).on('dataloaded.medicine', function(){
            $('#medicine-input').typeahead({
                source: DAO.data.medicine,
                matcher: Prescription.utils.typeAhedMatcher ,
                sorter: Prescription.utils.typeAhedSorter

            });
        });


        $('#dose-schedule').typeahead({
            sorter: function(items){
                var numbers = this.query.match(/(\d+)/g)
                  , items

                while(numbers.length < 3)
                    numbers.push(0);
               return [numbers.join(' + ')];
            }
        });


    },

    initializeModal: function(){
        $('#confirm-dialog').delegate('.btn.ok', 'click', function(){
           if(modalCallback) {modalCallback(); return false;}
        });
    },
    showConfirmDialog: function (title, text, callback) {
        modalCallback = callback;
        $('#confirm-dialog').find('.modal-header h3').text(title);
        $('#confirm-dialog').find('.modal-body p').html(text);
        $('#confirm-dialog').modal('show')
    },

    chromePrintWorkground: function(){
        // detect if browser is Chrome
        if(navigator.userAgent.toLowerCase().indexOf("chrome") >  -1) {
            // wrap private vars in a closure
            var $waitDialog = $('#wait-dialog').modal({keyboard: false, show: false});
            var realPrintFunc = Prescription.print; //window.print;
            var interval = 20000; // 20 secs
            var nextAvailableTime = +new Date(); // when we can safely print again
            var timerId;

            // overwrite window.print function
            //window.print =
            Prescription.print = function() {
                var now = +new Date();
                // if the next available time is in the past, print now
                if(now > nextAvailableTime) {
                    realPrintFunc();
                    nextAvailableTime = now + interval;
                } else {

                    // print when next available
                    clearTimeout(timerId);
                    timerId = setTimeout(function(){
                        $waitDialog.modal('hide');
                        setTimeout(realPrintFunc, 2000);
                        nextAvailableTime += interval;
                    }, nextAvailableTime - now);
                    $waitDialog.modal('show');

                }
            }
        }
    },


    syncAllData: function(callback){

        var item,
            timerId,
            types = ['cc', 'oe', 'tests', 'advice', 'medicine'];
        var total = types.length;
        //$('#data-load-status').slideDown('fast');
        $( '#data-load-status' ).effect( 'drop', {direction: 'down', mode: 'show'}, 500);
        var callBack = function(){
            if(item = types.shift()){
                DAO.selectiveSyncData(item, callBack);
            }

            var pct = (100 / total) * (total - types.length);
            $('#data-load-status .bar').css('width', pct+'%');
            if(pct >= 99 ) {
                clearTimeout(timerId);
                timerId = setTimeout( function(){
                    $('#data-load-status').effect( 'drop', {direction: 'down', mode: 'hide'}, 500, function(){$('#data-load-status .bar').css('width', '0%');});
                    if(callback) callback();

                }, 3000);
            }

        }
        callBack();
    },

    loadAllData: function(callback){

        var item,
            timerId,
            types = ['cc', 'oe', 'tests', 'advice', 'medicine'];
        var total = types.length;
        //$('#data-load-status').slideDown('fast');
        $( '#data-load-status' ).effect( 'drop', {direction: 'down', mode: 'show'}, 500);
        var callBack = function(){
            if(item = types.shift()){
                DAO.loadData(item, callBack);
            }

            var pct = (100 / total) * (total - types.length);
            $('#data-load-status .bar').css('width', pct+'%');
            if(pct >= 99 ) {
               clearTimeout(timerId);
               timerId = setTimeout( function(){
                   $('#data-load-status').effect( 'drop', {direction: 'down', mode: 'hide'}, 500, function(){$('#data-load-status .bar').css('width', '0%');});
                   if(callback) callback();

               }, 3000);
            }

        }
        callBack();
    },

    settingsFeature: function(){
        $('#settings').click(function(){
            $('#settings-dialog').modal('show');
        });

        $('#create-db').click(function(){
            var $this = $(this);
            $this.button('loading');
            DAO.resetDatabase(function(){$this.button('complete');})
        });

        $('#reload-db').click(function(){
            var $this = $(this);
            $this.button('loading');
            Prescription.loadAllData(function(){$this.button('complete');})
        });

        $('#load-sample-data').click(function(){
            var $this = $(this);
            $this.button('loading');
            DAO.loadDummyData();
            $this.button('complete');
        });

        $('#sync-db').click(function(){
            var $this = $(this);
            $this.button('loading');
            Prescription.syncAllData(function(){$this.button('complete');})
        });

    }
}





    Prescription.utils = {
        typeAhedHighlighter: function (item) {
            var hasSubquery = this.query.indexOf('>') > -1
                , mainQuery = hasSubquery ? this.query.split('>', 2)[0].trim() : this.query
                , subQuery = hasSubquery ? this.query.split('>', 2)[1].trim() : ''
                , query = hasSubquery ? mainQuery + ' > ' + subQuery : this.query
                , query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
                , matchFound = false

            item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>'
                matchFound = true
            })

            if(!matchFound) {
                item = item.replace(new RegExp('(' + mainQuery.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&') + ')', 'ig'), function ($1, match) {
                    return '<strong>' + match + '</strong>'
                })

                if(subQuery) {
                    item = item.replace(new RegExp('(' + subQuery.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&') + ')', 'ig'), function ($1, match) {
                        return '<strong>' + match + '</strong>'
                    })
                }
            }

            return item;
        },

        typeAhedMatcher:function(item){
            var query = this.query,
                hasSubquery = this.query.indexOf('>') > -1;

            if(hasSubquery) {
                query = this.query.split('>', 2)[0].trim();
                return item.name == query;
            }

            return ~item.name.toLowerCase().indexOf(query.toLowerCase());
        },

        typeAhedSorter: function (items) {
            var childMatch = []
                , beginswith = []
                , caseSensitive = []
                , caseInsensitive = []
                , item
                , hasSubquery = this.query.indexOf('>') > -1
                , mainQuery = hasSubquery ? this.query.split('>', 2)[0].trim() : this.query
                , subQuery = hasSubquery ? this.query.split('>', 2)[1].trim() : ''


            while (item = items.shift()) {
                if(mainQuery.toLowerCase() == item.name.toLowerCase() && item.comments) {
                    $(item.comments).each(function (idx, comment){
                        var numbers = subQuery.match(/(\d+)/g);
                        var i = 0;
                        var tmp = comment.comment.replace(/({num})/g, function(s, key){
                            return numbers && i < numbers.length ? numbers[i++] : s;
                        });

                        if(tmp.toLowerCase().indexOf(subQuery.toLowerCase()) > -1)
                            childMatch.push(item.name + ' > ' + tmp);
                        else if(!subQuery)
                            childMatch.push(item.name + ' > ' + tmp);
                    });
                }
                if (!item.name.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item.name)
                else if (~item.name.indexOf(this.query)) caseSensitive.push(item.name)
                else caseInsensitive.push(item.name)
            }

            return childMatch.concat(beginswith, caseSensitive, caseInsensitive);
        }
    }

window.Prescription = Prescription;

$(document).ready(function(){
    Prescription.init();
})
})(window, jQuery, document);


(function( $ ){
    $.fn.serializeJSON=function() {
        var json = {};
        jQuery.map($(this).serializeArray(), function(n, i){
            json[n['name']] = n['value'];
        });
        return json;
    };
})( jQuery )
