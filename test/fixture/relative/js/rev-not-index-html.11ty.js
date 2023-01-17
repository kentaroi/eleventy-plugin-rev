class Test {
  data() {
    return {
      permalink: "relative/js/rev-not-index-html.html"
    };
  }
  render(data) {
    return this.rev("../bar/style.css");
  }
}

module.exports = Test;
