import { MaterialIcons, Entypo, Ionicons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';

export const iconTagGenerator = function (type, name) {
    switch (type) {
        case 'dash':
            return (<Ionicons name="ellipsis-horizontal-outline" size={18} color="black" />);
        case 'solid':
            return (<Ionicons name="remove-outline" size={23} color="black" />);
        case '1':
            return (<MaterialCommunityIcons name="roman-numeral-1" size={24} color="black" />);
        case '2':
            return (<MaterialCommunityIcons name="roman-numeral-2" size={24} color="black" />);
        case '3':
            return (<MaterialCommunityIcons name="roman-numeral-3" size={24} color="black" />);
        case 'normalHead':
            return (<Ionicons name="ellipsis-horizontal-outline" size={18} color="black" />);
        case 'arrowHead':
            if (name == 'isStartPoint') {
                return (<Ionicons name="arrow-back-outline" size={20} color="black" />);
            } else {
                return (<Ionicons name="arrow-forward-outline" size={20} color="black" />);
            }

    }
}