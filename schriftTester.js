// Define a view class for the type tester widget
class TesterView {
  constructor(config, container) {
    this.config = config
    this.container = container
    this.controlPanel = appendControlPanel(config.controlPlacement, container);
    this.textSampleArea = appendTextSampleArea(config, container);
    this.init()
  }
  
  init(){
    this.setContainerStyle();
    this.placeUIElements();

  }
  placeUIElements() {
    for (const elem in this.config) {
      switch (elem) {
        case "fontSize":
        case "lineHeight":
        case "letterSpacing":
          if (this.config[elem].visible) {
            appendSlider(this.config[elem], this.controlPanel, this.update.bind(this), elem);
          };
      }    
    }
  }


  setContainerStyle() {
    this.container.classList.add("tester");
    this.container.style.display = "flex";
    switch (this.config.controlPlacement) {
      case "top":
        this.container.style.flexDirection = "column";
        break;
      case "bottom":
        this.container.style.flexDirection = "column-reverse";
        this.container.style.height = "100vh";
        break;
      case "left":
      this.container.style.justifyContent = "space-between";
      this.container.style.flexDirection = "row";
        break;
      case "right":
      this.container.style.justifyContent = "space-between";
      this.container.style.flexDirection = "row-reverse";
        break;
      default:
        // Default placement is left
        this.container.style.justifyContent = "space-between";
        this.container.style.flexDirection = "row";

        
    }
  }

  update(propName) {
    switch (propName) {
      case "fontSize":
      case "lineHeight":
      case "letterSpacing":
        this.textSampleArea.style[propName] = this.config[propName].value + this.config[propName].units;
    }
  }
}

// Define a config class for the type tester widget
class TesterConfig {
  constructor(container) {
    this.rawDate = container.dataset;
    this.controlPlacement = { panel: 'left' };
    this.labelFont = null;
    this.fontFamily = null;
    this.styles = { label: "Styles", value: "Regular", options: ["Regular"], visible: true, };
    this.fontSize = { label: "Size", value: 80, min: 4, max: 300, units: 'px', visible: true, };
    this.lineHeight = { label: "Leading", value: 100, min: 75, max: 150, step: 0.1, units: '%', visible: true, };
    this.letterSpacing = { label: "Tracking", value: 0, min: -5, max: 20, step: 0.1, units: 'px', visible: true, };
    this.alignment = { label: "Left", value: "Left", options: ["Left", "Center", "Right", "One line"], visible: true, };
    this.case = { label: "Case", value: "Unchanged", options: ["Unchanged", "Lowercase", "Uppercase", "Capitalize"], visible: true, };
    this.features = {};
    this.variations = {};
    this.text = "";
    this.editable = true;
    this.init()
  }

  // Read and parse the style, size, etc from data-* attributes
  // and initialize the type tester
  init() {
    
    for (const [key, value] of Object.entries(this.rawDate)) {
      switch (key) {
        case "text":
        case "labelFont":
        case "controlPlacement":
        case "fontFamily":
          this[key] = value
          break;
        case "styles":
        case "alignment":
        case "case":
          const optionsParams = parseOptionsParams(value);
          for (const [paramKey, paramValue] of Object.entries(optionsParams)) {
            if (paramValue) {
              this[key][paramKey] = paramValue;
              // console.log(key, "=>", paramKey, ":", paramValue);
            }
          }
          break;
        case "fontSize":
        case "lineHeight":
        case "letterSpacing":
          const sliderParams = parseSliderParams(value);
          for (const [paramKey, paramValue] of Object.entries(sliderParams)) {
            if (paramValue) {
              this[key][paramKey] = paramValue;
              // console.log(key, "=>", paramKey, ":", paramValue);
            }
          }
          break;
      } 
    } 
  }
}

class Tester {
  constructor(html_container) {
    this.config = new TesterConfig(html_container)
    this.view = new TesterView(this.config, html_container)
  }
}

function initTesters() {
  const testerContainers = document.querySelectorAll('div[name="tester"]');
  const testers = [];
  
  testerContainers.forEach((container) => {
    const tester = new Tester(container);
    testers.push(tester);
  });
  return testers;
}


function appendSlider(sliderParams, container, update, propName) {
  
  var wrapper = document.createElement("div");
  var labels = document.createElement("div");
  var labelName = document.createElement("div");
  var labelValue = document.createElement("div");
  var labelNameText = document.createTextNode(sliderParams.label);
  var labelValueText = document.createTextNode(sliderParams.value + " " + sliderParams.units);
  var slider = document.createElement("input");

  labelName.classList.add("control-panel-label-name");
  labelValue.classList.add("control-panel-label-value");
  slider.classList.add("control-panel-slider");
  wrapper.classList.add("control-panel-slider-container");

  slider.type = "range";
  slider.min = sliderParams.min;
  slider.max = sliderParams.max;
  slider.value = sliderParams.value;

  if (sliderParams.step) slider.step = sliderParams.step;
  
  slider.oninput = () => {
    labelValueText.nodeValue = slider.value + " " + sliderParams.units;
    sliderParams.value = slider.value;
    update(propName, sliderParams.value)
  }

  labels.style.display = "flex";
  labels.style.flexDirection = "row";
  labels.style.flexWrap = "nowrap";
  labels.style.justifyContent = "space-between";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  labelName.appendChild(labelNameText);
  labelValue.appendChild(labelValueText);
  labels.appendChild(labelName);
  labels.appendChild(labelValue);
  wrapper.appendChild(labels);
  wrapper.appendChild(slider);
  container.appendChild(wrapper);
}


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
      if (label) label = label.trim();
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
      if (label) label = label.trim();
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

function appendControlPanel(align, container) {
  var controlPanel = document.createElement("div");
  controlPanel.classList.add("control-panel");
  // controlPanel.style.borderWidth = "thick";
  switch (align){
    case "left":
      controlPanel.style.borderWidth = "0 1px 0 0";
      controlPanel.style.minHeight = "100vh";
      break;
    case "right":
      controlPanel.style.borderWidth = " 0 0 0 1px";
      controlPanel.style.minHeight = "100vh";
      break;
    case "top":
      controlPanel.style.borderWidth = "1px 0 0 0";
      break;
    case "bottom":
      controlPanel.style.borderWidth = "1px 0 0 0";
      break;
}
  container.appendChild(controlPanel);
  return controlPanel;
}

function appendTextSampleArea(config, container) {
  var textSampleArea = document.createElement("div");
  var textSample = document.createTextNode(config.text);
  if (config.editable) {
    textSampleArea.contentEditable = true;
  }
  textSampleArea.appendChild(textSample);
  textSampleArea.style.flexGrow = "1";
  textSampleArea.style.fontFamily = config.fontFamily + " " + config.styles.value;
  textSampleArea.style.fontSize = config.fontSize.value + config.fontSize.units
  textSampleArea.classList.add("text-sample-area");
  container.appendChild(textSampleArea);
  return textSampleArea;
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
