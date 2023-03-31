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
    for (const option in this.config) {
      this.update(option);
    }
  }

  placeUIElements() {
    for (const elem in this.config) {
      switch (elem) {
        case "fontFamily":
          appendHeader(this.config[elem], this.controlPanel);
        case "fontSize":
        case "lineHeight":
        case "letterSpacing":
          if (this.config[elem].visible) {
            appendSlider(this.config[elem], this.controlPanel, this.update.bind(this), elem);
          };
          break;
        case "style": {
          if (this.config[elem].visible) {
            appendDropdown(this.config, elem, this.controlPanel, this.update.bind(this));
          };
        }
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
    log(`updating ${propName}...`)
    switch (propName) {
      case "fontSize":
        this.textSampleArea.style[propName] = this.config[propName].value + this.config[propName].units;
      case "lineHeight":
      case "letterSpacing":
        if (this.config["letterSpacing"].units === '%') {
          var units = this.config.fontSize.units;
          var value = this.config.fontSize.value / 100 * this.config["letterSpacing"].value;
        } else {
          var units = this.config["letterSpacing"].units;
          var value = this.config["letterSpacing"].value;
        }
        this.textSampleArea.style["letterSpacing"] = value + units;
      case "lineHeight":
        if (this.config["lineHeight"].units === '%') {
          var units = this.config.fontSize.units;
          var value = this.config.fontSize.value / 100 * this.config["lineHeight"].value;
        } else {
          var units = this.config["lineHeight"].units;
          var value = this.config["lineHeight"].value;
        }
        this.textSampleArea.style["lineHeight"] = value + units;
        break;
      case "style":
        this.textSampleArea.style.fontFamily = this.config.fontFamily + " " + this.config.style.value
        break;

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
    this.style = { label: "Style", value: "Regular", options: ["Regular"], visible: true, };
    this.fontSize = { label: "Size", value: 80, min: 4, max: 300, units: 'pt', unitsLabel: null, visible: true, };
    this.lineHeight = { label: "Leading", value: 100, min: 75, max: 150, step: 0.1, units: '%', unitsLabel: null, visible: true, };
    this.letterSpacing = { label: "Tracking", value: 0, min: 50, max: 100, step: 0.1, units: '%', unitsLabel: null, visible: true, };
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
        case "alignment":
        case "case":
        case "style":
          const optionsParams = parseListParams(value);
          for (const [paramKey, paramValue] of Object.entries(optionsParams)) {
            if (paramValue) {
              this[key][paramKey] = paramValue;
              log(`${key} => ${paramKey}: ${paramValue}`);
            }
          }
          if (key === "style"){
          this[key]['label'] = this[key]['value'];
        }
          break;
        case "fontSize":
        case "lineHeight":
        case "letterSpacing":
          const sliderParams = parseSliderParams(value.trim());
          log(`input: ${value}`);
          for (const [paramKey, paramValue] of Object.entries(sliderParams)) {
            if (paramValue) {
              this[key][paramKey] = paramValue;
              log(`${key} => ${paramKey}: ${paramValue}`);
            } else {
              log(`${key} -| ${paramKey}: ${paramValue}`);
              if (paramKey === "unitsLabel") {
                if (sliderParams.units) {
                  this[key][paramKey] = sliderParams.units;
                } else {
                  this[key][paramKey] = this[key].units;
                }
                log(`assigned: ${this[key][paramKey]}`);
              }
          }
          }
          break;
        case "features":
          this[key] = parseFeatures(value.trim())
          log(`${key} => ${JSON.stringify(this[key])}`);
          break;
        
        } 
      log(`\n`);
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


function appendDropdown(config, paramName, container, update) {
  let dropdownParams = config[paramName]
  var wrapper = document.createElement("div");
  var valuePicker = document.createElement("div");
  var currentValue = document.createElement("div");
  var currentValueText = document.createTextNode(dropdownParams.value);
  var downButton = document.createElement("div");
  var downButtonIcon = document.createTextNode("@chevrondown");
  var line = document.createElement("div");
  var menuPanel = document.createElement("div");
  
  for (const option of dropdownParams.options) {
    var menuElement = document.createElement("div");
    var menuElementText = document.createTextNode(option);
    menuElement.appendChild(menuElementText);
    menuElement.classList.add('tester-menu-panel-element');
    menuElement.classList.add("tester-button");
    
    menuPanel.appendChild(menuElement);
    menuElement.onclick = function () {
      config[paramName].value = option;
      currentValueText.nodeValue = option;
      menuPanel.classList.toggle("tester-menu-panel-show");
      update(paramName);
    };
  }

  downButton.classList.add("tester-icons");
  valuePicker.classList.add("tester-button");
  line.classList.add("tester-line-separator");
  menuPanel.classList.add("tester-menu-panel");
  wrapper.classList.add("control-panel-container");
  
  valuePicker.style.display = "flex";
  valuePicker.style.flexDirection = "row";
  valuePicker.style.flexWrap = "nowrap";
  valuePicker.style.justifyContent = "space-between";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  
  valuePicker.onclick = function () {
    menuPanel.classList.toggle("tester-menu-panel-show");
    for (const child of menuPanel.children) {
      console.log(child.textContent, config[paramName].value, child.textContent === config[paramName].value)
      child.textContent === config[paramName].value ? child.classList.add("tester-menu-panel-element-current") : child.classList.remove("tester-menu-panel-element-current");
    }
  };


  currentValue.appendChild(currentValueText);
  downButton.appendChild(downButtonIcon);
  valuePicker.appendChild(currentValue);
  valuePicker.appendChild(downButton);
  wrapper.appendChild(valuePicker);
  wrapper.appendChild(line);
  wrapper.appendChild(menuPanel);
  container.appendChild(wrapper);
  
}

function appendHeader(familyName, container) {
  log(`familyName: ${familyName}`)
  var wrapper = document.createElement("div");
  var familyNameLabel = document.createElement("div");
  var familyNameLabelText = document.createTextNode(familyName);
  var buttons = document.createElement("div");
  var resetButton = document.createElement("div");
  var resetButtonIcon = document.createTextNode("@replay");
  var invertButton = document.createElement("div");
  var invertButtonIcon = document.createTextNode("@invert");

  wrapper.classList.add("tester-header");
  buttons.classList.add("tester-header-buttons");
  resetButton.classList.add("tester-icons");
  resetButton.classList.add("tester-button");
  invertButton.classList.add("tester-icons");
  invertButton.classList.add("tester-button");

  buttons.style.display = "flex";
  buttons.style.flexDirection = "row";
  buttons.style.flexWrap = "nowrap";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "row";
  wrapper.style.justifyContent = "space-between";

  familyNameLabel.appendChild(familyNameLabelText);
  resetButton.appendChild(resetButtonIcon);
  invertButton.appendChild(invertButtonIcon);
  buttons.appendChild(resetButton);
  buttons.appendChild(invertButton);
  wrapper.appendChild(familyNameLabel);
  wrapper.appendChild(buttons);
  container.appendChild(wrapper);

  }

function appendSlider(sliderParams, container, update, propName) {
  var wrapper = document.createElement("div");
  var labels = document.createElement("div");
  var labelName = document.createElement("div");
  var labelValue = document.createElement("div");
  var labelNameText = document.createTextNode(sliderParams.label);
  var labelValueText = document.createTextNode(sliderParams.value + " " + sliderParams.unitsLabel);
  var slider = document.createElement("input");

  labelName.classList.add("control-panel-label-name");
  labelValue.classList.add("control-panel-label-value");
  slider.classList.add("control-panel-slider");
  wrapper.classList.add("control-panel-container");
  wrapper.style.flexDirection = "column";

  slider.type = "range";
  slider.min = sliderParams.min;
  slider.max = sliderParams.max;
  slider.value = sliderParams.value;

  if (sliderParams.step) slider.step = sliderParams.step;
  
  slider.oninput = () => {
    labelValueText.nodeValue = slider.value + " " + sliderParams.unitsLabel;
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

function appendControlPanel(align, container) {
  var controlPanel = document.createElement("div");
  controlPanel.classList.add("control-panel");
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
  textSampleArea.style.fontFamily = config.fontFamily + " " + config.style.value;
  textSampleArea.style.fontSize = config.fontSize.value + config.fontSize.units
  textSampleArea.classList.add("text-sample-area");
  container.appendChild(textSampleArea);
  return textSampleArea;
}

// The valid formats are:
// - "0.1" or "[-5..0..20]" (label set to undefined)
// - "labelName 0.9" or "labelName [-5..0..20]" (label set to labelName)
// - "labelName [-5..0..20] unitLabel | units"
// - "labelName [-5..0..20] units" (unitLabel set to units)
function parseSliderParams(input) {
  const patternSliderRange = /^\s?(?<label>[\p{L}\p{P}\p{N}\p{Zs}\p{Emoji}]*?)?\s*\[\s*(?<min>-?\d+(\.\d+)?)\s*?\.\.\s*?(?<value>-?\d+(\.\d+)?)\s*?\.\.\s*?(?<max>-?\d+(\.\d+)?)\s*\]\s*(?:\s*(?<unitsLabel>[\p{L}\p{P}\p{N}\p{Zs}\p{Emoji}]+?)\s*(?:=|\|\s?)\s*)?(?<units>[a-zA-Z% ]+?)?\s?$/u;
  const patternNumber = /^\s?(?<label>[^\p{N}][\p{L}\p{P}\p{N}\p{Zs}\p{Emoji}]*?)?\s*(?<value>-?\d+(\.\d+)?)(?:\s*(?<unitsLabel>[^\p{N}][\p{L}\p{P}\p{N}\p{Zs}\p{Emoji}]+?)\s*(?:=|\|\s?)\s*)?(?<units>[a-zA-Z% ]+?)?\s?$/u;
  try {
    const matchSliderRange = input.match(patternSliderRange);
    if (matchSliderRange) {
      return matchSliderRange.groups;
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

function parseListParams(input) {
  const patternNamedList = /^([a-zA-Z0-9_ ]+)?\s*\[(.+)\]$/;
  const patternUnnamedList = /^(.+?)(\*?)$/;
  try {
    // Check if input matches named or unnamed pattern
    const matchNamed = input.match(patternNamedList);
    const matchUnnamed = input.match(patternUnnamedList);

    console.log("matchNamed", matchNamed)
    console.log("matchUnnamed", matchUnnamed)
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
          const optionsOptions = options.map((option) => !option.endsWith("*")); // Extract options options from options
          // const optionsOptions = options.filter((option) => !option.endsWith("*")); // Extract options options from options
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
        const optionsOptions = options.map(
          (option) => option.endsWith("*") ? option.slice(0, -1) : option
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

function parseFeatures(input) {
  const patternFeatureBlocks = /\s*\((?<label>[^|]*)\|(?<type>[^\s]*)\s*\[(?<tags>[^\]]*)\]\s*\)*?/g;
  const patternFeaturesList  = /(?<label>[^\[|;]*)?\s*\|(?<tag>[^:\s]+)\s*:\s*(?<value>[^;\]]+);*\s*/g;
  
  try {

    const features = [...input.matchAll(patternFeatureBlocks)].map((match) => ({
      label: match.groups.label,
      feature: match.groups.type,
      value: [...match.groups.tags.matchAll(patternFeaturesList)].map((feature) => ({
        label: feature.groups.label,
        tag: feature.groups.tag,
        value: feature.groups.value,}))
    }));
    return features;

  } catch (error) {
    console.error(`${error.message}`);
    return;
  }
}


let LOGGING_IS_ON = true;

function log(message) {
  if (LOGGING_IS_ON) {console.log(message)};
}
