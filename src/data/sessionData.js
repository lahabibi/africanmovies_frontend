import profileImage from "../assets/images/img_profile.png";

// Later this value will come from the cached current-user API response.
// Set this to null to preview the logged-out navbar before auth is wired.
export const currentUser = {
  id: "user-john-doe",
  name: "John Doe",
  email: "john.doe@email.com",
  avatar: profileImage,
};
