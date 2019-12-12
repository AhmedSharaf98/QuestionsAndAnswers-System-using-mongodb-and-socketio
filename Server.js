const mongodb = require('mongodb').MongoClient;
const socket_io = require('socket.io').listen(4040).sockets;

var questionsWithAnswers = [
    {question: "What kind of documentation do I need to travel?", answer: "Before you may board a flight, all passengers 18 years of age and older are required to present photo ID issued by a \
    government authority (example: driver’s license or passport). If you don’t have either of those, please consult directly \
    with the airline for alternatives. If you are traveling outside of the United States, all passengers are required to have a passport."},
    {question: "Do I need to reconfirm my flights before I leave?", answer: "It isn’t mandatory, but we highly encourage you to do so. Airlines regularly alter their schedules or change their flight \
    numbers. We make every attempt to contact you when there is a change. However, there are rare occasions when we \
    are not correctly notified by the airlines that a change has occurred. Reconfirmation helps to detect a problem before \
    you arrive at the airport. We recommend that you contact us or check with the airline directly 24-72 hours prior to \
    departure."},
    {question: "When do I need to be at the airport to check in for my flight?", answer: "It varies on airline and destination. It is always best to check directly with the airline. You can help avoid vacation \
    stress by arriving at most airports at least 90 minutes prior to scheduled departure time for domestic flights and 120 \
    minutes prior for International flights. Some large airports like Chicago O’Hare, New York JFK, Los Angeles, etc \
    require even more time so plan accordingly."},
    {question: "What do I need to avoid packing in my carry-on bag?", answer: "You are not allowed weapons or sharp weapon like objects. It is recommended that sharp cuticle scissors be placed in \
    your checked luggage. Butane type cigarette lighters, matches, flammable liquids, fireworks, household items such as \
    bleach, drain cleaners and other toxic chemicals are not allowed and will be confiscated. It is always good practice \
    to check with applicable carrier for specific details."},
    {question: "Can I obtain my boarding pass before I get to the airport?", answer: "Yes. As technology continues to improve, airlines encourage you to check in advance. Please visit the web-site of the \
    airline involved. In most cases you will need your reservation number (also called record locator #) OR e-ticket \
    number. Most boarding passes can only be issued within 24 hours of flight time."},
    {question: "Is travel insurance really necessary?", answer: "Travel Protection plans are available and recommended to help protect you and your trip investment. Travel \
    Protection Policies offered by most major travel insurance providers include benefits such as Trip Cancellation, Trip \
    Interruption, Emergency Medical and Emergency Evacuation/Repatriation, Trip Delay, Baggage Delay and more. \
    Please ask our trained travel professionals for details."},
    {question: "Do I need a passport to travel outside the United States and how do I get one if I do?", answer: "The Intelligence Reform and Terrorism Prevention Act of 2004 requires that by January 1, 2008 travelers to/from all \
    international destinations INCLUDING Canada, Caribbean, Bermuda, Bahamas & Mexico must have a passport."},
    {question: "When should I buy my airline ticket? Is there a way to game the system?", answer: "Book a ticket when you need it. And no, there isn’t. But it’s a qualified “no.” Research suggests that if you buy your \
    ticket when most people do — between one and four months before you fly — you’re likely to find the lowest price. \
    Don’t push the button too early or too late, because fares tend to rise, especially as you close in on your departure \
    date. Some airfare soothsayers claim you can find a bargain by waiting until a particular day and time, like Wednesday \
    at 1 a.m. in the airline’s time zone. But the savings are minimal and probably not worth your time, not to mention the \
    lost sleep."},
    {question: "Can I take this-or-that item in my carry-on?", answer: "Since 2006, the Transportation Security Administration has limited “wet” substances to 3.4 ounces in one quart-size \
    plastic zip-top bag. The restriction covers liquids, gels, aerosols, creams and pastes, with an exception for travelers \
    needing larger quantities of medications, baby formula/food and breast milk for the flight. (Be sure to inform the \
    security officer of your extras.) However, many items, such as nail polish pens and coconut cream pie, fall into a \
    blurry area. For these objects, plus thousands more, the agency has designed an app and online tool called “Can I \
    Bring My...?” For example, plug in tapioca pudding, gummy worms and denture glue, and the Oracle responds with\
    “check only,” “check or carry on” and “special instructions” (3-1-1 applies). Also, remember that TSA restricts objects \
    that look or behave like weapons, such as baseball bats and water guns. The best advice: If you have any doubt, pack \
    it in your checked bag or leave it at home."},
    {question: "Where can I find hotel deals online?", answer: "Hotel bargains are plastered all over the big online sites, such as Expedia , Orbitz and Booking . They’re almost\
    impossible to miss. Don’t forget the hotel Web sites, too, which may offer equally attractive deals with better terms.\
    But which deals can you trust? Let me warn you about two common gotchas. First, the so-called “opaque” rates on\
    sites such as Hotwire and Priceline, which can deliver spectacular deals — up to 40 percent off the published rate —\
    but with a few notable restrictions. You don’t find out which hotel you’ve booked until you’ve paid for it, and the\
    purchase is completely nonrefundable. So if you’re liable to change your mind or you want a sure thing, book\
    somewhere else. The second general category is the travel club. These are aggressively marketed memberships that\
    supposedly offer access to deep discounts. I haven’t found a legitimate one yet, so if you see a pitch for a travel club,\
    don’t walk away — run!"},
];

mongodb.connect('mongodb://127.0.0.1/travelagency', function(error, db){
    if(error) throw error;
   
    console.log("Connected to Mongo Successfully");
    socket_io.on('connection', function(socket){
        console.log("Connected to Sockets Successfully");
        let questions = db.collection('questions');
        //Check whether the questions collection has values or not..
        questions.count(function (err, count) {
            if (!err && count === 0) {
                questions.insertMany(questionsWithAnswers, function(){
                    console.log("Populated the DB Successfully");
                });
            }
        });
        //Retrive all question(Without Answers) and emit them to the client
        socket.on('server-questions', function(data){
            questions.find({},{answer: 0}).sort({_id:1}).toArray(function(error, result){
                if(error) throw error;
                socket.emit('client-questions', result);
            });
        });

        //Retrive Answer for a specific question
        socket.on('server-answer', function(data){
            console.log("Server: Answer Requested..");
            let _question = data.question;
            console.log("Server: Question is ", _question);
            questions.find({question : _question},{answer: 1}).toArray(function(error, result){
                if(error) throw error;
                console.log("Server: Answer returned is ", result);
                socket.emit('client-answer', result);
            });
        });
    });
});
