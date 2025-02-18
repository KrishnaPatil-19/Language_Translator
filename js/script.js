// Grabbing required DOM elements
const fromText = document.querySelector(".from-text"),
  toText = document.querySelector(".to-text"),
  exchangeIcon = document.querySelector(".exchange"),
  selectTag = document.querySelectorAll("select"),
  icons = document.querySelectorAll(".row i"),
  translateBtn = document.querySelector("button");

// Populating the select dropdowns with language options
selectTag.forEach((tag, id) => {
  for (let countryCode in countries) {
    const isSelected =
      id === 0 ? countryCode === "en-GB" : countryCode === "hi-IN";
    const option = `<option value="${countryCode}" ${
      isSelected ? "selected" : ""
    }>${countries[countryCode]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

// Swapping input and output text as well as language selections
exchangeIcon.addEventListener("click", () => {
  const tempText = fromText.value;
  const tempLang = selectTag[0].value;
  fromText.value = toText.value;
  toText.value = tempText;
  selectTag[0].value = selectTag[1].value;
  selectTag[1].value = tempLang;
});

// Clearing translation output when input is cleared
fromText.addEventListener("keyup", () => {
  if (!fromText.value.trim()) toText.value = "";
});

// Translation API call and error handling
translateBtn.addEventListener("click", async () => {
  const text = fromText.value.trim();
  const translateFrom = selectTag[0].value;
  const translateTo = selectTag[1].value;

  if (!text) {
    alert("Please enter some text to translate.");
    return;
  }

  toText.setAttribute("placeholder", "Translating...");

  try {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${translateFrom}|${translateTo}&mt=1`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch translation.");
    const data = await response.json();
    const translation =
      data.responseData.translatedText || "Translation unavailable.";
    toText.value = translation;
  } catch (error) {
    console.error("Error during translation:", error);
    alert("Translation failed. Please check your internet connection or try again later.");
  } finally {
    toText.setAttribute("placeholder", "Translation");
  }
});

// Ensure voices are loaded before using
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  console.log("Available voices:", voices);
};


// Adding functionality to icons (copy and speech)
icons.forEach((icon) => {
  icon.addEventListener("click", ({ target }) => {
    if (!fromText.value.trim() && !toText.value.trim()) return;

    if (target.classList.contains("fa-copy")) {
      const textToCopy = target.id === "from" ? fromText.value : toText.value;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => alert("Text copied to clipboard!"))
        .catch(() => alert("Failed to copy text."));
    } else if (target.classList.contains("fa-volume-up")) {
      const text = target.id === "from" ? fromText.value : toText.value;
      const lang = target.id === "from" ? selectTag[0].value : selectTag[1].value;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find((voice) => voice.lang === lang);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        speechSynthesis.speak(utterance);
      } else {
        alert(
          `Speech output is not available for the selected language: ${
            countries[utterance.lang]
          }`
        );
      }
    }
  });
});

