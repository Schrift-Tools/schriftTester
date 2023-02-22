// Define a class for the type tester widget
class TypeTester {

  constructor(container) {
    this.container = container;
    this.fontName = null;
    this.styles = {value: 'Regular', available: ['Regular']};
    this.size = {label: "Size", value: 80, min: 4, max: 300};
    this.leading = {label: "Leading", value: 1.2, min: 0.9, max: 1.5};
    this.tracking = {label: "Tracking", value: 0, min: -5, max: 20};
    this.alignment = 'Left';
    this.case = 'Unchanged';
    this.features = {};
    this.variations = {};
    this.editable = true;

    Object.defineProperty(this, "text", {
      get() {
        return this.container.innerHTML.trim();
      },
      set() {
        this.updateText();
      }
    });
  }

  // Read and parse the style, size, etc from data-* attributes
  // and initialize the type tester
  init() {
    // Iterate over attributes
    // Set instance variables accordingly
    // Create UI controls based on parsed attributes
    // Render the type tester

    // Turn div editable if necessary
    if (this.editable) {
      this.container.contentEditable = "true";
    }
  }

  // Create a dropdown UI control
  createDropdown(label, options, defaultOption, onChange) {
    // Create a dropdown with a label and options
    // Set the default selected option
    // Attach the onChange function to the change event of the dropdown
    // Return the dropdown
  }

  // Create a slider UI control
  createSlider(label, axis, min, max, defaultVal, onChange) {
    // Create a slider with a label and axis
    // Set the minimum, maximum and default values
    // Attach the onChange function to the input event of the slider
    // Return the slider
  }

  // Create a special radio toggles UI control with customizable icons
  createSpecialRadioToggles(label, options, defaultOption, icons, onChange) {
    // Create a block of radio toggles with a label and options
    // Set the default selected option
    // Use the icons object to set the icons for each option
    // Attach the onChange function to the change event of the radio toggles
    // Return the radio toggles block
  }

  // Create a special checkbox toggles UI control with customizable icons
  createSpecialCheckboxToggles(label, options, defaultOption, icons, onChange) {
    // Create a block of checkbox toggles with a label and options
    // Set the default selected option
    // Use the icons object to set the icons for each option
    // Attach the onChange function to the change event of the checkbox toggles
    // Return the checkbox toggles block
  }

  // Create a button UI control
  createButton(label, onClick) {
    // Create a button with a label
    // Attach the onClick function to the click event of the button
    // Return the button
  }

  // Render the type tester UI
  render() {
    // Render the text sample area
    // Render each UI control in the order they appear in the data-* attributes
    // Attach the UI controls to the container
  }

  // Update the text sample
  updateText() {
    // Update the text sample area with the current style settings
  }
}

// Initialize all type tester widgets on the page
function initTypeTesters() {
  // Find all divs with attribute name="typetester"
  const typetesterContainers = document.querySelectorAll('div[name="typetester"]');
  const typeTesters = [];
  // Create a TypeTester instance for each div and call the init method
  typetesterContainers.forEach(container => {
    const typeTester = new TypeTester(container);
    typeTester.init();
    typeTester.text = 'hello there';
    console.log(typeTester)
    typeTesters.push(typeTester)
  });
  return typeTesters;
}

// Regex expression to parse raw data-* attributes
const patternSliderRange = /^([a-zA-Z0-9_ ]+)?\s*\[\s*(-?\d+(\.\d+)?)\.\.(-?\d+(\.\d+)?)\.\.(-?\d+(\.\d+)?)\s*\]$/;
const patternNumber = /^([a-zA-Z0-9_ ]*?)\s*([0-9]*)$/;

// Parse raw string for slider params,
// optionally including a parameter name, and return an object
// with the parsed values as floats and the label (undefined if not present).
// The valid formats are:
// - "[-5..0..20]" or "0.1" (label set to undefined)
// - "labelName [-5..0..20]" or "labelName 0.9" (label set to labelName)
function parseSliderParams(input) {
  // Parse the things
}
