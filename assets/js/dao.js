DAO = {
    data: {
        cc: [],
        oe: [],
        tests: [],
        advice: [],
        treatment: []
    },

    loadData: function(){

    },

    loadDummyData: function() {
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
            {id: 4, name: 'রক্তের গ্রুপ' },
            {id: 5, name: 'পাগলামি' },
            {id: 6, name: 'বাঁদরামি' }
        ];

        DAO.data.advice = [
            {id: 1, count:4, text: 'বেশী বেশী তরল খাবার খাবেন।' },
            {id: 2, count:5, text: 'জ্বর থাকলে কুসুম গরম পানি দিয়ে শরীর মুছে দিবেন।' },
            {id: 3, count:2, text: 'মুড়ি থাকলে মুড়ি খাবেন।' },
            {id: 4, count:7, text: 'সকাল বেলা জুতা পড়ে ঘুমুবেন।' },
            {id: 5, count:1, text: 'পাঁচ ওয়াক্ত নামাজ পড়বেন।' }
        ];
    }
}