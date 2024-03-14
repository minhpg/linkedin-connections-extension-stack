// pages/privacy-policy.js

// import { useRouter } from "next/router";

export default function PrivacyPolicy() {
  // const router = useRouter();

  return (
    <article className="prose container mx-auto">
      <h1>Privacy Policy </h1>

      <span className="flex items-center justify-between">
        <b> Lyra | LinkedIn Extension</b>
        <p>
          <b>Last updated:</b> March 14, 2024
        </p>
      </span>

      <p>
        This privacy policy governs your use of the software application{" "}
        <b>Lyra | LinkedIn Extension</b> that was created by Minh Pham, and
        Arthur Wong. The Extension is designed to automatically scrape your
        LinkedIn connections and store information about your 1st and 2nd order
        connections on LinkedIn.
      </p>

      <h2>Information Collection and Use</h2>
      <p>The Extension collects the following types of information:</p>
      <ul>
        <li>
          <strong>LinkedIn Cookies and Session Cookies:</strong> The Extension
          accesses and stores LinkedIn cookies and session cookies to maintain
          your authentication and session information while interacting with
          LinkedIn.
        </li>
        <li>
          <strong>LinkedIn Connections:</strong> The Extension collects and
          stores information about your 1st and 2nd order connections on
          LinkedIn, including names, titles, and connection details.
        </li>
      </ul>
      <p>
        The collected information is used solely for the purpose of providing
        and improving the functionality of the Extension. We do not sell, share,
        or rent your personal information to third parties.
      </p>

      <h2>Data Storage</h2>
      <p>
        The information collected by the Extension is stored locally on your
        device and is not transmitted to any external servers or third parties.
      </p>

      <h2>Security</h2>
      <p>
        We take reasonable measures to protect the information collected by the
        Extension. However, no method of electronic storage is 100% secure, and
        we cannot guarantee absolute security.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page. You are
        advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions or suggestions about our Privacy Policy, do
        not hesitate to contact us at arthur[at]chunai.dev .
      </p>
    </article>
  );
}
