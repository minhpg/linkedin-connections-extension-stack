import { Text } from "@tremor/react";

/** Dashboard Footer component */
const Footer = () => {
  return (
    <footer className="footer footer-center w-full p-6">
      <div className="text-center">
        <Text className="font-light text-sm">
          Copyright © {new Date().getFullYear()} -{" "}
          Built with ❤️ by Lyra Technologies
        </Text>
      </div>
    </footer>
  );
};

export default Footer;
