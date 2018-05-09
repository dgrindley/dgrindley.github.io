$(document).ready(function() {
    facts = [
        "Over 10 billion donuts are made in the U.S. every year!",
        "There are 10 people in the U.S. with the last name Doughnut!",
        "Donuts were first invented by Hanson Gregory in 1847!",
        "The largest donut ever made weighed in at 1.7 tons!",
        "January 12 is National Glazed Doughnut Day!",
        "Donuts were served to soldiers during WWI!"
    ];

    $("#fun_fact").append(" " + facts[Math.floor(Math.random() * facts.length)]);
})