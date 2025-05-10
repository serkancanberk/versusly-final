export default function getStatusLabel(clash) {
  const now = new Date();
  const createdAt = new Date(clash.createdAt);
  const expiresAt = new Date(clash.expires_at);
  const hasArguments = Array.isArray(clash.Clash_arguments) && clash.Clash_arguments.length > 0;
  const hasReactions = clash.reactions && Object.values(clash.reactions).some(val => val > 0);

  if (now > expiresAt) {
    return "finished";
  } else if (hasArguments || hasReactions) {
    return "hot";
  } else {
    return "new";
  }
}