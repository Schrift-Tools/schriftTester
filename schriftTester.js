// Define a view class for the type tester widget
class TesterView {
  constructor(config, container) {
    this.config = config;
    this.container = container;
    this.controlPanel = newControlPanel(config.controlPlacement, container);
    this.textSampleArea = appendTextSampleArea(config, container);
    this.init();
  }

  init() {
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
          appendHeader(this.config[elem], this.controlPanel, this.reset.bind(this));
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
        break;
        case "features": {
          appendFeatures(this.config, this.controlPanel, this.update.bind(this))
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

  reset() {
    for (const propName in this.config) {
      if (
        typeof this.config[propName] === "object" &&
        "default" in this.config[propName]
      ) {
        this.config[propName].value = this.config[propName].default;
        this.update(propName);
        this.updateView(propName)
      }
      for (const subPropName in this.config[propName]) {
        if (
          typeof this.config[propName][subPropName] === "object" &&
          "tags" in this.config[propName][subPropName]
        ) {
          for (const tag in this.config[propName][subPropName].tags) {
            this.config[propName][subPropName].tags[tag].value =
            this.config[propName][subPropName].tags[tag].default;
          }
          this.update(propName);
          this.updateView(propName)
        }
      }
    }
  }
  updateView(propName) {
    if (propName in this.controlPanel){
      this.controlPanel[propName].value = this.config[propName].default;
    }
    if (propName === "features"){
      this.config.features.forEach((_, blockIndex) => {
        this.config.features[blockIndex].tags.forEach((_, featureIndex) => {
          this.controlPanel.features[blockIndex][featureIndex].value = this.config.features[blockIndex].tags[featureIndex].default;
        })})
    }
  }
  update(propName) {
    log(`updating ${propName}...`);
    switch (propName) {
      case "fontSize":
        this.textSampleArea.style[propName] = this.config[propName].value + this.config[propName].units;
      case "lineHeight":
      case "letterSpacing":
        if (this.config["letterSpacing"].units === "%") {
          var units = this.config.fontSize.units;
          var value = this.config.fontSize.value / 100 * this.config["letterSpacing"].value;
        } else {
          var units = this.config["letterSpacing"].units;
          var value = this.config["letterSpacing"].value;
        }
        this.textSampleArea.style["letterSpacing"] = value + units;
      case "lineHeight":
        if (this.config["lineHeight"].units === "%") {
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
      case "features":
        var features = [];
        for (const featureBlock of this.config["features"]) {
          for (const tag of Object.values(featureBlock.tags)) {
            if (tag.tag === "locl") {
              if (tag.value == 1) {
                this.textSampleArea.setAttribute("lang", tag.lang);
                features.push(`'${tag.tag}' ${tag.value}`);
              }
            } else {
              features.push(`'${tag.tag}' ${tag.value}`);
            }
          }
        }
        this.textSampleArea.style["fontFeatureSettings"] = features.join(", ");
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
    this.style = { label: "Style", default: "Regular", value: "Regular", options: ["Regular"], visible: true, };
    this.fontSize = { label: "Size", default: 80, value: 80, min: 4, max: 300, units: 'pt', unitsLabel: null, visible: true, };
    this.lineHeight = { label: "Leading", default: 100, value: 100, min: 75, max: 150, step: 0.1, units: '%', unitsLabel: null, visible: true, };
    this.letterSpacing = { label: "Tracking", default: 0, value: 0, min: 50, max: 100, step: 0.1, units: '%', unitsLabel: null, visible: true, };
    this.alignment = { label: "Left", default: "Left", value: "Left", options: ["Left", "Center", "Right", "One line"], visible: true, };
    this.case = { label: "Case", default: "Unchanged", value: "Unchanged", options: ["Unchanged", "Lowercase", "Uppercase", "Capitalize"], visible: true, };
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

function appendFeatures(config, controlPanel, update) {
  controlPanel['features'] = []
  const features = config.features;
  var wrapper = document.createElement("div");
  
  features.forEach((featureBlock, blockIndex) => {
    controlPanel['features'].push([])
    var block = document.createElement("div");
    var blockLabel = document.createElement("div");
    var blockLabelText = document.createTextNode(featureBlock.label);
    block.appendChild(blockLabel);
    blockLabel.appendChild(blockLabelText);

    block.classList.add("tester-feature-block");
    blockLabel.classList.add("tester-feature-block-label");

    featureBlock.tags.forEach((tag, featureIndex) => {
      controlPanel['features'][blockIndex].push([])
      var tagElement = document.createElement("div");
      var tagControl = document.createElement("div");
      var tagInput = document.createElement("input");
      var tagLabel = document.createElement("div");
      var tagLabelText = document.createTextNode(tag.label);
      var tagCode = document.createElement("div");
      var tagCodeText = document.createTextNode(tag.tag);
      
      tagInput.type = featureBlock.type;
      tagInput.name = featureBlock.label;
      tagInput.checked = parseInt(tag.value);
      tagInput.onchange = function () {
        if (tagInput.checked) {
          if (tagInput.type === "radio") {
            config.features[blockIndex].tags.forEach((tag) => {
              tag.value = 0;
            });
          }
          config.features[blockIndex].tags[featureIndex].value = 1;
      } else {
          config.features[blockIndex].tags[featureIndex].value = 0;
        };
        update("features");
        
      };
      Object.defineProperty(controlPanel["features"][blockIndex][featureIndex], "value", {
        set: function(newValue) {
          tagInput.checked = parseInt(newValue);
        },
        configurable: true 
      });
      log(`!!!${tag.label}, tag.value: ${tag.value}`)

      tagControl.style.display = "flex";
      tagControl.style.flexDirection = "row";
      tagControl.style.flexWrap = "nowrap";
      tagElement.style.display = "flex";
      tagElement.style.flexDirection = "row";
      tagElement.style.flexWrap = "nowrap";
      tagElement.style.justifyContent = "space-between";

      if (tagInput.type === "radio") {
        tagInput.classList.add("tester-radio-button");
      } else if (tagInput.type === "checkbox") {
        tagInput.classList.add("tester-checkbox");
      }
      
      tagElement.classList.add("tester-feature-tag");
      tagLabel.classList.add("tester-feature-tag-label");
      tagCode.classList.add("tester-feature-tag-code");

      tagLabel.appendChild(tagLabelText);
      tagCode.appendChild(tagCodeText);
      tagControl.appendChild(tagInput);
      tagControl.appendChild(tagLabel);
      tagElement.appendChild(tagControl);
      tagElement.appendChild(tagCode);
      block.appendChild(tagElement);
    });    
    wrapper.appendChild(block);
  })
  controlPanel.container.appendChild(wrapper);
}


function appendDropdown(config, propName, controlPanel, update) {
  controlPanel[propName] = {};
  let dropdownParams = config[propName];
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
      config[propName].value = option;
      currentValueText.nodeValue = option;
      menuPanel.classList.toggle("tester-menu-panel-show");
      update(propName);
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
      child.textContent === config[propName].value ? child.classList.add("tester-menu-panel-element-current") : child.classList.remove("tester-menu-panel-element-current");
    }
  };

  Object.defineProperty(controlPanel[propName], "value", {
    set: function(newValue) {
      currentValueText.nodeValue = newValue;
    },
    configurable: true 
  });

  currentValue.appendChild(currentValueText);
  downButton.appendChild(downButtonIcon);
  valuePicker.appendChild(currentValue);
  valuePicker.appendChild(downButton);
  wrapper.appendChild(valuePicker);
  wrapper.appendChild(line);
  wrapper.appendChild(menuPanel);
  controlPanel.container.appendChild(wrapper);
  
}

function appendHeader(familyName, controlPanel, reset) {
  log(`familyName: ${familyName}`)
  var wrapper = document.createElement("div");
  var familyNameLabel = document.createElement("div");
  var familyNameLabelText = document.createTextNode(familyName);
  var buttons = document.createElement("div");
  var resetButton = document.createElement("div");
  var resetButtonIcon = document.createTextNode("@replay");
  var invertButton = document.createElement("div");
  var invertButtonIcon = document.createTextNode("@invert");

  resetButton.onclick = function () {
    reset();
  };

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
  controlPanel.container.appendChild(wrapper);

  }

  function appendSlider(sliderParams, controlPanel, update, propName) {
    controlPanel[propName] = {};
    var wrapper = document.createElement("div");
    var labels = document.createElement("div");
    var labelSlider = document.createElement("div");
    var labelSliderText = document.createTextNode(sliderParams.label);
    
    var labelValueUnits = document.createElement("div");
    var labelValue = document.createElement("div");
    var labelValueText = document.createTextNode(sliderParams.value);
    var labelUnits = document.createElement("div");
    var labelUnitsText = document.createTextNode(sliderParams.unitsLabel);
    
    var slider = document.createElement("input");
    
    labelSlider.classList.add("control-panel-label-name");
    labelValue.classList.add("control-panel-label-value");
    labelUnits.classList.add("control-panel-label-units");
    slider.classList.add("control-panel-slider");
    wrapper.classList.add("control-panel-container");
    wrapper.style.flexDirection = "column";
    
    slider.type = "range";
    slider.min = sliderParams.min;
    slider.max = sliderParams.max;
    slider.value = sliderParams.value;
    
    if (sliderParams.step) slider.step = sliderParams.step;
    
    labelValue.contentEditable = true;

    labelValue.addEventListener("input", () => {
      if (labelValue.innerHTML === "<br>") {
        labelValue.innerHTML = sliderParams.min;
      }
    })

    labelValue.addEventListener("keydown", (event) => {
      if (
        (event.key >= 0 && event.key <= 9) ||
        event.key === "." ||
        event.key === "-" ||
        event.key === "Backspace" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
        ) {
          // Set a timeout to update the value after the key is processed
          setTimeout(() => {
            var value = parseFloat(labelValue.innerHTML);
            if (isNaN(value)) {
              value = sliderParams.min; 
            }; 
            sliderParams.value = value + "";
            slider.value = value;
            update(propName, sliderParams.value);
        }, 100);
      } else {
        event.preventDefault();
      }
    });

  slider.oninput = () => {
    labelValue.innerHTML = slider.value;
    sliderParams.value = slider.value;
    update(propName, sliderParams.value);
  }

  Object.defineProperty(controlPanel[propName], "value", {
    set: function(newValue) {
      labelValue.innerHTML = newValue;
      slider.value = newValue;
    },
    configurable: true 
  });

  labels.style.display = "flex";
  labels.style.flexDirection = "row";
  labels.style.flexWrap = "nowrap";
  labels.style.justifyContent = "space-between";
  labelValueUnits.style.display = "flex";
  labelValueUnits.style.flexDirection = "row";
  labelValueUnits.style.flexWrap = "nowrap";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  labelSlider.appendChild(labelSliderText);
  labelValue.appendChild(labelValueText);
  labelUnits.appendChild(labelUnitsText);
  labels.appendChild(labelSlider);
  labelValueUnits.appendChild(labelValue);
  labelValueUnits.appendChild(labelUnits);
  labels.appendChild(labelValueUnits);
  wrapper.appendChild(labels);
  wrapper.appendChild(slider);
  controlPanel.container.appendChild(wrapper);

}

function newControlPanel(align, container) {
  var controlPanel = {container: document.createElement("div")};
  controlPanel.container.classList.add("control-panel");
  switch (align){
    case "left":
      controlPanel.container.style.borderWidth = "0 1px 0 0";
      controlPanel.container.style.minHeight = "100vh";
      break;
    case "right":
      controlPanel.container.style.borderWidth = " 0 0 0 1px";
      controlPanel.container.style.minHeight = "100vh";
      break;
    case "top":
      controlPanel.container.style.borderWidth = "1px 0 0 0";
      break;
    case "bottom":
      controlPanel.container.style.borderWidth = "1px 0 0 0";
      break;
}
  container.appendChild(controlPanel.container);
  return controlPanel;
}

function appendTextSampleArea(config, container) {
  var textSampleAreaContainer = document.createElement("div");
  var textSampleArea = document.createElement("div");
  var textSample = document.createTextNode(config.text);
  if (config.editable) {
    textSampleArea.contentEditable = true;
  }
  textSampleArea.spellcheck = false;
  textSampleArea.lang = 'en';
  
  textSampleArea.style.flexGrow = "1";
  textSampleArea.style.fontFamily = config.fontFamily + " " + config.style.value;
  textSampleArea.style.fontSize = config.fontSize.value + config.fontSize.units
  textSampleAreaContainer.classList.add("text-sample-area-container");
  textSampleArea.classList.add("text-sample-area");
  
  textSampleArea.appendChild(textSample);
  textSampleAreaContainer.appendChild(textSampleArea);
  container.appendChild(textSampleAreaContainer);
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
    if (matchSliderRange.groups.value) {
      matchSliderRange.groups.default = matchSliderRange.groups.value;
    }
    if (matchSliderRange) {
      return matchSliderRange.groups;
    }

    const matchNumber = input.match(patternNumber);
    if (matchNumber) {
      var [_, label, value, units] = matchNumber;
      if (label) label = label.trim();
      return {
        label: label,
        value: parseFloat(value),
        default: parseFloat(value),
        units: units,
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
          return { label: label, default: defaultValue, value: defaultValue, options: optionsOptions };

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
        return { label: label, default: value, value: value, options: undefined };

        // If there is no default value and only one option
      } else {
        const value = optionsString; // Extract value
        return { label, default: value, value: value, options: undefined };
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
      type: match.groups.type,
      tags: [...match.groups.tags.matchAll(patternFeaturesList)].map((feature) => {
        const [tag, lang] = feature.groups.tag.split('-');
        return {
          label: feature.groups.label,
          tag: tag,
          lang: lang,
          default: feature.groups.value,
          value: feature.groups.value
        };
      })
    }));
    
    return features;

  } catch (error) {
    console.error(`${error.message}`);
    return;
  }
}


let LOGGING_IS_ON = false;

function log(message) {
  if (LOGGING_IS_ON) {console.log(message)};
}
