DAO = {
    endPoints: {
        sync: 'index.php/sync'
    },

    data: {
        cc: [],
        oe: [],
        tests: [],
        advice: [],
        treatment: []
    },

    getCheifComplainByName: function(name){
        for(var i=0;i<DAO.data.cc.length;i++) {
            if(DAO.data.cc[i].name == name) return DAO.data.cc[i];
        }
    },

    getOnsiteExamenationByShortName: function(shortName) {
        for(var i=0;i<DAO.data.oe.length;i++) {
            if(DAO.data.oe[i].shortName == shortName) return DAO.data.oe[i];
        }
    },

    loadData: function(){

    },

    syncData: function(){
           var req = {
               data: DAO.data
           }

        $.post(DAO.endPoints.sync, {request: JSON.stringify(req)}, function(){
            alert("Done");
        })
    },

    loadDummyData: function() {
       DAO.data.cc = [
           {id: 1, name: 'Fever', comments: [
               {id: 1, comment: '{num} days' },
               {id: 9, comment: '{num} days {num} times' },
               {id: 2, comment: 'night' },
               {id: 3, comment: 'Day and night' },
               {id: 4, comment: '{num} times' }
           ]},
           {id: 2, name: 'Abdominal Pain'},
           {id: 3, name: 'Headache'},
           {id: 4, name: 'Diarrhoea'},
           {id: 5, name: 'Blind while sleeping'},
           {id: 6, name: 'Vomitting'}
       ];

       DAO.data.oe = [
           {id: 1, name: 'Pulse', shortName: 'P', unit: '' },
           {id: 2, name: 'Blood Pressure', shortName: 'BP', unit: '' },
           {id: 3, name: 'Pulse', shortName: 'H-L', unit: '' },
           {id: 4, name: 'Pulse', shortName: 'R/R', unit: '' },
           {id: 5, name: 'Pulse', shortName: 'P', unit: '' }
       ];

        DAO.data.tests = [
            {id: 1, name: 'CBC' },
            {id: 2, name: 'CBD' },
            {id: 3, name: 'CBE' },
            {id: 4, name: 'CBF' },
            {id: 5, name: 'RBS' },
            {id: 6, name: 'LFT' },
            {id: 7, name: 'রক্তের গ্রুপ' },
            {id: 8, name: 'পাগলামি' },
            {id: 9, name: 'বাঁদরামি' }
        ];

        DAO.data.advice = [
            {id: 1, useCount:4, text: 'বেশী বেশী তরল খাবার খাবেন।' },
            {id: 2, useCount:5, text: 'জ্বর থাকলে কুসুম গরম পানি দিয়ে শরীর মুছে দিবেন।' },
            {id: 3, useCount:2, text: 'মুড়ি থাকলে মুড়ি খাবেন।' },
            {id: 4, useCount:7, text: 'সকাল বেলা জুতা পড়ে ঘুমুবেন।' },
            {id: 5, useCount:1, text: 'পাঁচ ওয়াক্ত নামাজ পড়বেন।' }
        ];
    }
}