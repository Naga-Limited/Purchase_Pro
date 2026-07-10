import { useSelector } from "react-redux";

export const useAuth = () => {
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  return {
    userId: UserDetails.userId,
    plantIds: UserDetails.plantids,
    defaultPlantId:
      UserDetails.plantids && UserDetails.plantids.length === 1
        ? { label: UserDetails.plantids[0], value: UserDetails.plantids[0] }
        : undefined,
    details: UserDetails,
  };
};
