// Define a class for the type tester widget
class Tester {
  constructor(container) {
    this.container = container;
    this.fontName = null;
    this.styles = {
      label: "Styles",
      value: "Regular",
      options: ["Regular"],
    };
    this.size = { label: "Size", value: 80, min: 4, max: 300 };
    this.leading = {
      label: "Leading",
      value: 1.2,
      min: 0.9,
      max: 1.5,
    };
    this.tracking = { label: "Tracking", value: 0, min: -5, max: 20 };
    this.alignment = {
      label: "Left",
      value: "Left",
      options: ["Left", "Right"],
    };
    this.case = {
      label: "Case",
      value: "Unchanged",
      options: ["Unchanged", "Lowercase", "Capitalize"],
    };
    this.features = {};
    this.variations = {};
    this.editable = true;

    Object.defineProperty(this, "text", {
      get() {
        return this.container.innerHTML.trim();
      },
      set() {
        this.updateText();
      },
    });
  }

  // Read and parse the style, size, etc from data-* attributes
  // and initialize the type tester
  init() {
    for (const [key, value] of Object.entries(this.container.dataset)) {
      switch (key) {
        case "font":
          this.fontName = value.trim();
          break;
        case "styles":
        case "alignment":
        case "case":
          const optionsParams = parseOptionsParams(value);
          for (const [paramKey, paramValue] of Object.entries(optionsParams)) {
            if (paramValue) {
              this[key][paramKey] = paramValue;
              console.log(key, "=>", paramKey, ":", paramValue);
            }
          }
          break;
        case "size":
        case "leading":
        case "tracking":
          const sliderParams = parseSliderParams(value);
          for (const [paramKey, paramValue] of Object.entries(sliderParams)) {
            if (paramValue) {
              this[key][paramKey] = paramValue;
              console.log(key, "=>", paramKey, ":", paramValue);
            }
          }
          break;
      }
    }

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
function initTesters() {
  // Find all divs with attribute name="tester"
  const testerContainers = document.querySelectorAll('div[name="tester"]');
  const testers = [];
  // Create a Tester instance for each div and call the init method
  testerContainers.forEach((container) => {
    const tester = new Tester(container);
    tester.init();
    tester.text = "hello there";
    // console.log(tester)
    testers.push(tester);
  });
  return testers;
}

// Parse raw string for slider params,
// optionally including a parameter name, and return an object
// with the parsed values as floats and the label (undefined if not present).
// The valid formats are:
// - "[-5..0..20]" or "0.1" (label set to undefined)
// - "labelName [-5..0..20]" or "labelName 0.9" (label set to labelName)
function parseSliderParams(input) {
  const patternSliderRange =
    /^([a-zA-Z0-9_ ]+)?\s*\[\s*(-?\d+(\.\d+)?)\.\.(-?\d+(\.\d+)?)\.\.(-?\d+(\.\d+)?)\s*\]$/;
  const patternNumber = /^([a-zA-Z0-9_ ]*?)\s*([0-9]*)$/;
  try {
    const matchSliderRange = input.match(patternSliderRange);
    if (matchSliderRange) {
      var [, label, min, , value, , max] = matchSliderRange;
      if (label) label = label.trim()
      return {
        label: label,
        value: parseFloat(value),
        min: parseFloat(min),
        max: parseFloat(max),
      };
    }
    
    const matchNumber = input.match(patternNumber);
    if (matchNumber) {
      var [_, label, value] = matchNumber;
      if (label) label = label.trim()
      return {
        label: label,
        value: parseFloat(value),
      };
    }

    throw new Error(`Invalid slider params string: ${input}`);
  } catch (error) {
    console.error(`${error.message}`);
    return;
  }
}

function parseOptionsParams(input) {
  const patternNamedOptionList = /^([a-zA-Z0-9_ ]+)?\s*\[(.+)\]$/;
  const patternUnnamedOptionList = /^(.+?)(\*?)$/;
  try {
    // Check if input matches named or unnamed pattern
    const matchNamed = input.match(patternNamedOptionList);
    const matchUnnamed = input.match(patternUnnamedOptionList);

    // If input is named
    if (matchNamed) {
      const label = matchNamed[1].trim(); // Extract label from input
      const options = matchNamed[2]
        .split(/[;,]/)
        .map((option) => option.trim()); // Extract options from input
      const defaultValueIndex = options.findIndex((option) =>
        option.endsWith("*")
      ); // Find index of default value
      const defaultValue =
        defaultValueIndex >= 0
          ? options[defaultValueIndex].slice(0, -1)
          : options[0]; // Extract default value from options
      const optionsOptions = options.filter((option) => !option.endsWith("*")); // Extract options options from options
      return { label: label, value: defaultValue, options: optionsOptions };

      // If input is unnamed
    } else if (matchUnnamed) {
      const label = undefined; // Label is undefined for unnamed inputs
      const optionsString = matchUnnamed[1]; // Extract options from input
      const hasDefault = matchUnnamed[2] !== ""; // Check if there is a default value

      // If there are multiple options
      if (optionsString.includes(";")) {
        const options = optionsString.split(";").map((option) => option.trim()); // Extract options from input
        const defaultValueIndex = options.findIndex((option) =>
          option.endsWith("*")
        ); // Find index of default value
        const defaultValue =
          defaultValueIndex >= 0
            ? options[defaultValueIndex].slice(0, -1)
            : options[0]; // Extract default value from options
        const optionsOptions = options.filter(
          (option) => !option.endsWith("*")
        ); // Extract options options from options
        return { label: label, value: defaultValue, options: optionsOptions };

        // If there is a default value, but only one option
      } else if (hasDefault) {
        const value = optionsString; // Extract default value
        return { label: label, value: value, options: undefined };

        // If there is no default value and only one option
      } else {
        const value = optionsString; // Extract value
        return { label, value, options: undefined };
      }
    }
    throw new Error(`Invalid option list params string: ${input}`);
  } catch (error) {
    console.error(`${error.message}`);
    return;
  }
}
