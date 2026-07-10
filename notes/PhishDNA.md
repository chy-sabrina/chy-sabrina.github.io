# Why I want to build PhishDNA?

Remember in around Feb 2026, I saw a post on Threads that said "Wow, this looks so similar to the real HSBC website" with a screen capture of phishing site that tries to minimic HSBC's website.  
Comments below told them not to enter any sensitive information. Then, they said "Of course I won't! I stay safe as long as I don't enter any information".  
By then, I realized that many people who are not familiar with tech/ cybersecurity have this misconception.

In fact, there are some aggressive attack that does not require victims to enter any information. For example, XSS and Drive-by-Download.

And this is the reason why I want to build PhishDNA.

At first, the planned system flow is:

```text
Read the active tab's URL
      ↓
Send the URL to backend
      ↓
Extract the required features for risk score prediction
      ↓
Pre-trained model (engine.pkl) will predict the risk score
      ↓
Apply override rules (whitelisting & penalty rules)
      ↓
Calculate final risk score

If final risk score > 75 (danger)
      ↓
Block the HTTP request and include a pop-up window to ask whether the user wants to continue visiting that site
```

However, due to time limitation and technical difficulty, the final system flow is:

```text
Read the active tab's URL
      ↓
Send the URL to backend
      ↓
Extract the required features for risk score prediction
      ↓
Pre-trained model (engine.pkl) will predict the risk score
      ↓
Apply override rules (whitelisting & penalty rules)
      ↓
Calculate final risk score
      ↓
Display the final risk score + explaination to user through the browser extension
```

# Struggling (?) process

- Week 1: collecting initial datasets + model training

- Week 2: testing, testing and testing  
  Found out huge issue:  
  - Accuracy, recall, precision all over 90% in test dataset  
  - But when I inputted real URLs (copy from my browsing history), the model flagged almost every URL as danger

- Week 3: refining scoring rules & logic  
  Keep modifying the rules (e.g., replace "URL length score" into "effective length score", set a maximum feature importance score to avoid one feature dominiating the whole scoring logic)  
  WITHOUT checking the training dataset :/

- Week 4: report writing (background + movitation + research of existing solutions)

- Week 5: expanding dataset  
  Finally checked the exisiting dataset and found out that:
  - dataset for legitimate URLs is all short, clean FQDNs (e.g., www[.]apple[.]com)
  - dataset for phishing URLs is all long, non-human-readable URLs (e.g., hxxps[:]//www[.]n49ajinipr4[.]xyz/4po9hnpinpanp)  
  After finding out such difference, I immediately search for other globally recognized datasets.

- Week 6 & 7: refining scoring rules & logic  
  Added the most important feature (in my opinion): brand deception tactics

  > We have seen lots of phishing URLs in phishing SMS, such as hxxps[:]//www[.]whatsd-app[.]com/verify-account  
  > This URL obviously is trying to disguise as the WhatsApp website.  
  > However, machines cannot distinguish whether the URL is trying to pose as an official website or not.

- Week 8: browser extension development & refinement  
  With the help of Codex, I connected the trained model to a browser extension.  
  However, at first, it was found that the risk score predicted in the browser extension and that when I inputted the URL into the terminal are different.  
  Then, I found out that hard override rules (e.g., if TLD is ".gov.hk", then set risk score to 0) were not implemented in the browser extension.

# Takeaways

- There are many ways to identify a phishing URL
- Phishing URLs are highly related to social engineering attack (especially phishing email and phishing SMS)
- Training a model to anaylze phishing URLs is MUCH harder than I thought
- The impact of dataset bias is extremely significant
