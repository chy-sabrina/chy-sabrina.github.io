# Why I want to build PhishDNA?

# Struggling (?) process

- Week 1: collecting initial datasets + model training

- Week 2: testing, testing and testing  
  Found out huge issue:  
  - Accuracy, recall, precision all over 90% in test dataset  
  - But when I inputted real URLs (copy from my browsing history), the model flagged almost every URL as danger

- Week 3: refining scoring rules & logic  
  Keep modifying the rules (e.g., replace "URL length score" into "effective length score", set a maximum feature importance score to avoid one feature dominiating the whole scoring logic)  
  WITHOUT checking the training dataset :/

- Week 4 & 5: report writing (background + movitation + research of existing solutions)

- Week 6: expanding dataset  
  Finally checked the exisiting dataset and found out that:
  - dataset for legitimate URLs is all short, clean FQDNs (e.g., www[.]apple[.]com)
  - dataset for phishing URLs is all long, non-human-readable URLs (e.g., hxxps[:]//www[.]n49ajinipr4[.]xyz/4po9hnpinpanp)  
  After finding out such difference, I immediately search for other globally recognized datasets.

- Week 7: refining scoring rules & logic  
  Added the most important feature (in my opinion): brand deception tactics

  > We have seen lots of phishing URLs in phishing SMS, such as hxxps[:]//www[.]whatsd-app[.]com/verify-account  
  > This URL obviously is trying to disguise as the WhatsApp website  
  > However, for machine, they do not know that this link is trying to pose as an official website

- Week 8: browser extension development & refinement  
  With the help of Codex, I connected the trained model to a browser extension.  
  However, at first, it is found that the risk score predicted in the browser extension and that when I inputted the URL into the terminal are different.  
  Then, I found out that hard override rules (e.g., if TLD is ".gov.hk", then set risk score to 0) are not implemented in the browser extension.

# Takeaways

- There are many ways to identify a phishing URL
- Phishing URLs are highly related to social engineering attack (especially phishing email and phishing SMS)
- Training a model to anaylze phishing URLs is MUCH harder than I thought
- The impact of dataset bias is extremely significant
