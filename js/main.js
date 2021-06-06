//------------------------NAVBAR ACTIVE LINKS------------------------//
$(".nav-link").on("click", function (e) {
  $(".nav-link").removeClass("active");
  $(this).addClass("active");
});

//------------------------SCROLL TO TOP------------------------//
var button = document.getElementById("scrollToTop");

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    button.style.display = "block";
  } else {
    button.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

//------------------------Change copyright year------------------------//
document.querySelector("#copyright-year").innerText = new Date().getFullYear();
